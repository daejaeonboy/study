#!/usr/bin/env node

import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

import { topics as legacyTopics } from "../src/lib/data/seed.ts";
import {
  editorialUsers,
  topicAssignments,
  topicReviewTasks,
} from "../src/lib/editorial-seed.ts";
import {
  buildLayerRows,
  buildRelationRows,
  buildRevisionRows,
  buildSourceRows,
  buildTopicRows,
  getImportMode,
  materializeSeedTopic,
  shouldDeleteExistingProjections,
} from "./supabase-seed-data.mjs";

const { loadEnvConfig } = nextEnv;
const args = new Set(process.argv.slice(2));
const force = args.has("--force");
const dryRun = args.has("--dry-run");

loadEnvConfig(process.cwd());

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function assertNoUnknownArgs() {
  const allowedArgs = new Set(["--force", "--dry-run"]);
  const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));

  if (unknownArgs.length) {
    throw new Error(`Unknown argument(s): ${unknownArgs.join(", ")}`);
  }
}

function mapEditorialUsers() {
  return editorialUsers.map((user) => ({
    id: user.id,
    display_name: user.displayName,
    email: user.email,
    role: user.role,
  }));
}

function mapTopicAssignments() {
  return topicAssignments.map((assignment) => ({
    topic_slug: assignment.topicSlug,
    assignee_id: assignment.assigneeId,
    assigned_by_id: assignment.assignedById,
    assigned_at: assignment.assignedAt,
    note: assignment.note ?? null,
  }));
}

function mapTopicReviewTasks() {
  return topicReviewTasks.map((task) => ({
    id: task.id,
    topic_slug: task.topicSlug,
    status: task.status,
    requester_id: task.requesterId,
    reviewer_id: task.reviewerId ?? null,
    requested_at: task.requestedAt,
    reviewed_at: task.reviewedAt ?? null,
    comment: task.comment ?? null,
  }));
}

async function throwIfError(result, action) {
  if (result.error) {
    throw new Error(`${action}: ${result.error.message}`);
  }

  return result.data;
}

async function countExistingSeedTopics(supabase, slugs) {
  const result = await supabase
    .from("topics")
    .select("slug", { count: "exact", head: true })
    .in("slug", slugs);

  if (result.error) {
    throw result.error;
  }

  return result.count ?? 0;
}

async function deleteProjectionRows(supabase, topicIds) {
  if (!topicIds.length) {
    return;
  }

  await throwIfError(
    await supabase.from("topic_relations").delete().in("from_topic_id", topicIds),
    "Delete seed topic relations",
  );
  await throwIfError(
    await supabase.from("topic_layers").delete().in("topic_id", topicIds),
    "Delete seed topic layers",
  );
  await throwIfError(
    await supabase.from("topic_sources").delete().in("topic_id", topicIds),
    "Delete seed topic sources",
  );
}

async function insertRows(supabase, table, rows, action) {
  if (!rows.length) {
    return;
  }

  await throwIfError(await supabase.from(table).insert(rows), action);
}

async function main() {
  assertNoUnknownArgs();

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const seedTopics = legacyTopics.map(materializeSeedTopic);
  const seedSlugs = seedTopics.map((topic) => topic.slug);

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const existingSeedTopicCount = await countExistingSeedTopics(supabase, seedSlugs);
  const mode = getImportMode({ dryRun, existingSeedTopicCount, force });

  if (mode === "dry-run") {
    console.log(
      JSON.stringify(
        {
          mode,
          existingSeedTopicCount,
          topics: seedTopics.length,
          editorialUsers: editorialUsers.length,
          assignments: topicAssignments.length,
          reviewTasks: topicReviewTasks.length,
        },
        null,
        2,
      ),
    );
    return;
  }

  const savedTopicRows = await throwIfError(
    await supabase.from("topics").upsert(buildTopicRows(seedTopics), { onConflict: "slug" }).select("id, slug"),
    "Upsert seed topics",
  );
  const topicIdsBySlug = new Map(savedTopicRows.map((row) => [row.slug, row.id]));
  const topicIds = [...topicIdsBySlug.values()];

  if (shouldDeleteExistingProjections(mode)) {
    await deleteProjectionRows(supabase, topicIds);
  }

  await insertRows(supabase, "topic_layers", buildLayerRows(topicIdsBySlug, seedTopics), "Insert seed topic layers");
  await insertRows(supabase, "topic_sources", buildSourceRows(topicIdsBySlug, seedTopics), "Insert seed topic sources");
  await insertRows(
    supabase,
    "topic_relations",
    buildRelationRows(topicIdsBySlug, seedTopics),
    "Insert seed topic relations",
  );

  await throwIfError(
    await supabase.from("topic_bundle_revisions").upsert(buildRevisionRows(seedTopics), {
      onConflict: "topic_slug,revision",
    }),
    "Upsert seed topic bundle revisions",
  );
  await throwIfError(
    await supabase.from("editorial_users").upsert(mapEditorialUsers(), { onConflict: "id" }),
    "Upsert editorial users",
  );
  await throwIfError(
    await supabase.from("topic_assignments").upsert(mapTopicAssignments(), { onConflict: "topic_slug" }),
    "Upsert topic assignments",
  );
  await throwIfError(
    await supabase.from("topic_review_tasks").upsert(mapTopicReviewTasks(), { onConflict: "id" }),
    "Upsert topic review tasks",
  );

  console.log(
    JSON.stringify(
      {
        mode,
        topics: seedTopics.length,
        layers: buildLayerRows(topicIdsBySlug, seedTopics).length,
        sources: buildSourceRows(topicIdsBySlug, seedTopics).length,
        relations: buildRelationRows(topicIdsBySlug, seedTopics).length,
        revisions: seedTopics.length,
        editorialUsers: editorialUsers.length,
        assignments: topicAssignments.length,
        reviewTasks: topicReviewTasks.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
