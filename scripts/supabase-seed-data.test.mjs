import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultTopicBundleReview } from "../src/content/topic-bundle-review-metadata.ts";
import { topics } from "../src/lib/data/seed.ts";
import {
  currentEditorialUserId,
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

const blackHole = topics.find((topic) => topic.slug === "black-hole");

if (!blackHole) {
  throw new Error("black-hole seed topic is missing");
}

test("creates legacy review metadata for reviewed and generated seed topics", () => {
  assert.deepEqual(createDefaultTopicBundleReview("black-hole"), {
    verificationStatus: "reviewing",
    sourceOrigin: "legacy-seed",
    revision: 1,
    importedAt: "2026-03-29T00:00:00+09:00",
    editorialSummary: "기존 시드 원본을 우선 적재한 상태입니다. 운영자 검토가 아직 끝나지 않았습니다.",
  });

  assert.deepEqual(createDefaultTopicBundleReview("epistemology"), {
    verificationStatus: "generated",
    sourceOrigin: "legacy-seed",
    revision: 1,
    importedAt: "2026-03-29T00:00:00+09:00",
    editorialSummary: "자동 적재된 원본입니다. 아직 운영 검토를 거치지 않았습니다.",
  });
});

test("materializes topic review metadata before building database rows", () => {
  const topic = materializeSeedTopic(blackHole);
  const [topicRow] = buildTopicRows([topic]);
  const [revisionRow] = buildRevisionRows([topic]);

  assert.equal(topic.verificationStatus, "reviewing");
  assert.equal(topic.sourceOrigin, "legacy-seed");
  assert.equal(topic.revision, 1);
  assert.equal(topicRow.slug, "black-hole");
  assert.equal(topicRow.importance_reason, blackHole.importance);
  assert.equal(topicRow.verification_status, "reviewing");
  assert.equal(revisionRow.topic_slug, "black-hole");
  assert.equal(revisionRow.revision, 1);
  assert.equal(revisionRow.bundle_payload.topic.slug, "black-hole");
  assert.equal(revisionRow.bundle_payload.review.verificationStatus, "reviewing");
});

test("builds projection rows for layers, sources, and relations", () => {
  const topic = materializeSeedTopic(blackHole);
  const topicIdsBySlug = new Map([
    ["black-hole", "topic-black-hole"],
    ["gravity", "topic-gravity"],
    ["spacetime", "topic-spacetime"],
    ["general-relativity", "topic-general-relativity"],
    ["scientific-revolution", "topic-scientific-revolution"],
    ["philosophy-of-science", "topic-philosophy-of-science"],
  ]);

  const layerRows = buildLayerRows(topicIdsBySlug, [topic]);
  const sourceRows = buildSourceRows(topicIdsBySlug, [topic]);
  const relationRows = buildRelationRows(topicIdsBySlug, [topic]);

  assert.equal(layerRows.length, 3);
  assert.deepEqual(
    layerRows.map((row) => row.depth).sort(),
    ["core", "deep", "light"],
  );
  assert.equal(layerRows[0].topic_id, "topic-black-hole");

  assert.ok(sourceRows.length > 0);
  assert.equal(sourceRows[0].topic_id, "topic-black-hole");
  assert.equal(sourceRows[0].trust_score, 5);

  assert.ok(relationRows.some((row) => row.relation_type === "prerequisite"));
  assert.ok(relationRows.some((row) => row.relation_type === "related"));
  assert.ok(relationRows.some((row) => row.relation_type === "cross_domain"));
  assert.ok(relationRows.every((row) => row.from_topic_id === "topic-black-hole"));
  assert.ok(relationRows.every((row) => typeof row.to_topic_id === "string"));
});

test("protects existing seed data unless force refresh is explicit", () => {
  assert.equal(
    getImportMode({ dryRun: true, existingSeedTopicCount: 20, force: false }),
    "dry-run",
  );
  assert.equal(
    getImportMode({ dryRun: false, existingSeedTopicCount: 0, force: false }),
    "initial",
  );
  assert.equal(
    getImportMode({ dryRun: false, existingSeedTopicCount: 20, force: true }),
    "force",
  );
  assert.throws(
    () => getImportMode({ dryRun: false, existingSeedTopicCount: 20, force: false }),
    /Refusing to overwrite 20 existing seed topic/,
  );
  assert.equal(shouldDeleteExistingProjections("dry-run"), false);
  assert.equal(shouldDeleteExistingProjections("initial"), false);
  assert.equal(shouldDeleteExistingProjections("force"), true);
});

test("keeps seed admin aligned with the bootstrap admin account", () => {
  const bootstrapAdmin = editorialUsers.find((user) => user.id === "bootstrap-admin");

  assert.equal(currentEditorialUserId, "bootstrap-admin");
  assert.equal(bootstrapAdmin?.email, "cryingonion77@gmail.com");
  assert.equal(bootstrapAdmin?.role, "admin");
  assert.ok(topicAssignments.every((assignment) => assignment.assignedById !== "ops-admin"));
  assert.ok(topicReviewTasks.every((task) => task.reviewerId !== "ops-admin"));
});
