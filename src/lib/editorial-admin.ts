import { topicToBundle } from "@/content/topic-bundles";
import type {
  ReviewTaskStatus,
  Topic,
  TopicAssignment,
  TopicReviewTask,
  VerificationStatus,
} from "@/lib/domain";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

const learningTimeByDepth = {
  light: 3,
  core: 8,
  deep: 15,
} as const;

export class RevisionConflictError extends Error {
  currentRevision: number;

  constructor(currentRevision: number) {
    super("Revision conflict");
    this.name = "RevisionConflictError";
    this.currentRevision = currentRevision;
  }
}

function getSupabaseAdminOrThrow() {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin config is not available.");
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase admin client could not be created.");
  }

  return client;
}

function normalizeTopicStatus(topic: Topic) {
  if (topic.verificationStatus === "published") {
    return "published";
  }

  if (topic.verificationStatus === "deprecated") {
    return "archived";
  }

  return "draft";
}

function normalizeVerificationStatus(status: VerificationStatus) {
  if (status === "published") {
    return "published";
  }

  if (status === "deprecated") {
    return "archived";
  }

  return "draft";
}

function normalizeSourceType(sourceType: string) {
  const normalized = sourceType.trim().toLowerCase();

  if (normalized.includes("백과")) {
    return "encyclopedia";
  }

  if (normalized.includes("오픈")) {
    return "open_course";
  }

  if (normalized.includes("철학")) {
    return "primary_text";
  }

  if (normalized.includes("공공")) {
    return "reference";
  }

  if (normalized.includes("논문")) {
    return "paper";
  }

  return "overview_article";
}

function normalizeDifficultyLevel(difficulty: string) {
  const normalized = difficulty.trim().toLowerCase();

  if (normalized.includes("연구")) {
    return "research";
  }

  if (normalized.includes("심화") || normalized.includes("고급")) {
    return "advanced";
  }

  if (normalized.includes("중급")) {
    return "intermediate";
  }

  return "introductory";
}

function clampTrustScore(value: number) {
  if (!Number.isFinite(value)) {
    return 3;
  }

  return Math.min(5, Math.max(1, Math.round(value)));
}

async function syncTopicProjection(topicId: string, topic: Topic) {
  const supabase = getSupabaseAdminOrThrow();

  const { error: deleteLayersError } = await supabase.from("topic_layers").delete().eq("topic_id", topicId);
  if (deleteLayersError) {
    throw deleteLayersError;
  }

  const { error: insertLayersError } = await supabase.from("topic_layers").insert(
    (["light", "core", "deep"] as const).map((depth) => ({
      topic_id: topicId,
      depth,
      title: topic.layers[depth].title,
      learning_time_minutes: learningTimeByDepth[depth],
      body_markdown: topic.layers[depth].body.join("\n\n"),
      key_takeaways: topic.layers[depth].keyIdeas,
      bridge_prompt: topic.layers[depth].bridgePrompt,
    })),
  );

  if (insertLayersError) {
    throw insertLayersError;
  }

  const { error: deleteSourcesError } = await supabase.from("topic_sources").delete().eq("topic_id", topicId);
  if (deleteSourcesError) {
    throw deleteSourcesError;
  }

  if (topic.sources.length) {
    const { error: insertSourcesError } = await supabase.from("topic_sources").insert(
      topic.sources.map((source) => ({
        topic_id: topicId,
        title: source.title,
        source_type: normalizeSourceType(source.type),
        url: source.url,
        publisher: source.publisher,
        difficulty_level: normalizeDifficultyLevel(source.difficulty),
        trust_score: clampTrustScore(source.trust),
        short_summary: source.summary,
      })),
    );

    if (insertSourcesError) {
      throw insertSourcesError;
    }
  }

  const { error: deleteRelationsError } = await supabase
    .from("topic_relations")
    .delete()
    .eq("from_topic_id", topicId);
  if (deleteRelationsError) {
    throw deleteRelationsError;
  }

  const referencedSlugs = Array.from(
    new Set([
      ...topic.prerequisites,
      ...topic.related,
      ...topic.crossDomainLinks.map((link) => link.topicSlug),
    ]),
  );

  if (!referencedSlugs.length) {
    return;
  }

  const { data: referencedTopics, error: referencedTopicsError } = await supabase
    .from("topics")
    .select("id, slug")
    .in("slug", referencedSlugs);

  if (referencedTopicsError) {
    throw referencedTopicsError;
  }

  const referencedTopicIdBySlug = new Map(
    (referencedTopics ?? [])
      .filter(
        (row): row is { id: string; slug: string } =>
          typeof row.id === "string" && typeof row.slug === "string",
      )
      .map((row) => [row.slug, row.id]),
  );

  const relationRows = [
    ...topic.prerequisites.map((slug) => ({
      to_topic_id: referencedTopicIdBySlug.get(slug),
      relation_type: "prerequisite",
      reason_text: "운영 편집본에서 지정한 선수지식입니다.",
    })),
    ...topic.related.map((slug) => ({
      to_topic_id: referencedTopicIdBySlug.get(slug),
      relation_type: "related",
      reason_text: "운영 편집본에서 지정한 관련 Topic입니다.",
    })),
    ...topic.crossDomainLinks.map((link) => ({
      to_topic_id: referencedTopicIdBySlug.get(link.topicSlug),
      relation_type: "cross_domain",
      reason_text: `${link.label}: ${link.reason}`,
    })),
  ]
    .filter(
      (relation): relation is {
        to_topic_id: string;
        relation_type: string;
        reason_text: string;
      } => typeof relation.to_topic_id === "string",
    )
    .map((relation) => ({
      from_topic_id: topicId,
      to_topic_id: relation.to_topic_id,
      relation_type: relation.relation_type,
      reason_text: relation.reason_text,
    }));

  if (!relationRows.length) {
    return;
  }

  const { error: insertRelationsError } = await supabase.from("topic_relations").insert(relationRows);
  if (insertRelationsError) {
    throw insertRelationsError;
  }
}

export async function saveEditorialTopic({
  topic,
  actorId,
  baseRevision,
}: {
  topic: Topic;
  actorId: string;
  baseRevision?: number;
}) {
  const supabase = getSupabaseAdminOrThrow();
  const now = new Date().toISOString();
  const { data: existingTopicRow, error: existingTopicError } = await supabase
    .from("topics")
    .select("id, revision, imported_at")
    .eq("slug", topic.slug)
    .maybeSingle();

  if (existingTopicError) {
    throw existingTopicError;
  }

  const currentRevision =
    typeof existingTopicRow?.revision === "number" ? existingTopicRow.revision : 0;

  if (typeof baseRevision === "number" && currentRevision !== baseRevision) {
    throw new RevisionConflictError(currentRevision);
  }

  const savedTopic: Topic = {
    ...topic,
    sourceOrigin: topic.sourceOrigin?.trim() || `editor:${actorId}`,
    revision: currentRevision + 1,
    importedAt:
      typeof existingTopicRow?.imported_at === "string"
        ? existingTopicRow.imported_at
        : topic.importedAt ?? now,
    lastReviewedAt: topic.lastReviewedAt ?? now,
    editorialSummary: topic.editorialSummary?.trim() || "운영 메모가 아직 없습니다.",
  };

  const { data: savedTopicRow, error: upsertTopicError } = await supabase
    .from("topics")
    .upsert(
      {
        slug: savedTopic.slug,
        title: savedTopic.title,
        summary: savedTopic.summary,
        importance_reason: savedTopic.importance,
        category: savedTopic.category,
        tags: savedTopic.tags,
        status: normalizeTopicStatus(savedTopic),
        verification_status: savedTopic.verificationStatus ?? "generated",
        source_origin: savedTopic.sourceOrigin,
        revision: savedTopic.revision,
        imported_at: savedTopic.importedAt,
        last_reviewed_at: savedTopic.lastReviewedAt,
        editorial_summary: savedTopic.editorialSummary,
        updated_at: now,
      },
      {
        onConflict: "slug",
      },
    )
    .select("id")
    .single();

  if (upsertTopicError) {
    throw upsertTopicError;
  }

  await syncTopicProjection(savedTopicRow.id, savedTopic);

  const { error: insertRevisionError } = await supabase.from("topic_bundle_revisions").insert({
    topic_slug: savedTopic.slug,
    revision: savedTopic.revision,
    verification_status: savedTopic.verificationStatus ?? "generated",
    source_origin: savedTopic.sourceOrigin,
    editorial_summary: savedTopic.editorialSummary,
    bundle_payload: topicToBundle(savedTopic),
    imported_at: savedTopic.importedAt,
    last_reviewed_at: savedTopic.lastReviewedAt,
  });

  if (insertRevisionError) {
    throw insertRevisionError;
  }

  return savedTopic;
}

export async function saveTopicAssignment({
  topicSlug,
  assigneeId,
  assignedById,
  note,
}: {
  topicSlug: string;
  assigneeId: string;
  assignedById: string;
  note?: string;
}): Promise<TopicAssignment> {
  const supabase = getSupabaseAdminOrThrow();
  const assignedAt = new Date().toISOString();
  const assignment = {
    topic_slug: topicSlug,
    assignee_id: assigneeId,
    assigned_by_id: assignedById,
    assigned_at: assignedAt,
    note: note?.trim() || null,
  };

  const { error } = await supabase.from("topic_assignments").upsert(assignment, {
    onConflict: "topic_slug",
  });

  if (error) {
    throw error;
  }

  return {
    topicSlug,
    assigneeId,
    assignedById,
    assignedAt,
    note: note?.trim() || undefined,
  };
}

function mapReviewStatusToVerificationStatus(status: ReviewTaskStatus) {
  switch (status) {
    case "approved":
      return "verified";
    case "changes_requested":
      return "reviewing";
    case "in_review":
      return "reviewing";
    default:
      return "reviewing";
  }
}

export async function saveTopicReviewTask({
  topicSlug,
  status,
  requesterId,
  reviewerId,
  comment,
}: {
  topicSlug: string;
  status: ReviewTaskStatus;
  requesterId: string;
  reviewerId?: string;
  comment?: string;
}): Promise<TopicReviewTask> {
  const supabase = getSupabaseAdminOrThrow();
  const requestedAt = new Date().toISOString();
  const reviewedAt = status === "pending" ? undefined : requestedAt;
  const taskId = crypto.randomUUID();

  const { error: insertTaskError } = await supabase.from("topic_review_tasks").insert({
    id: taskId,
    topic_slug: topicSlug,
    status,
    requester_id: requesterId,
    reviewer_id: reviewerId ?? null,
    requested_at: requestedAt,
    reviewed_at: reviewedAt ?? null,
    comment: comment?.trim() || null,
  });

  if (insertTaskError) {
    throw insertTaskError;
  }

  const { error: updateTopicError } = await supabase
    .from("topics")
    .update({
      verification_status: mapReviewStatusToVerificationStatus(status),
      last_reviewed_at: reviewedAt ?? requestedAt,
      updated_at: requestedAt,
    })
    .eq("slug", topicSlug);

  if (updateTopicError) {
    throw updateTopicError;
  }

  return {
    id: taskId,
    topicSlug,
    status,
    requesterId,
    reviewerId,
    requestedAt,
    reviewedAt,
    comment: comment?.trim() || undefined,
  };
}

export async function saveTopicVerificationStatus({
  topicSlug,
  status,
}: {
  topicSlug: string;
  status: VerificationStatus;
}) {
  const supabase = getSupabaseAdminOrThrow();
  const now = new Date().toISOString();
  const { data: topicRow, error: topicError } = await supabase
    .from("topics")
    .select("slug, revision")
    .eq("slug", topicSlug)
    .single();

  if (topicError) {
    throw topicError;
  }

  const revision = typeof topicRow?.revision === "number" ? topicRow.revision : null;

  const { error: updateTopicError } = await supabase
    .from("topics")
    .update({
      status: normalizeVerificationStatus(status),
      verification_status: status,
      last_reviewed_at: now,
      updated_at: now,
    })
    .eq("slug", topicSlug);

  if (updateTopicError) {
    throw updateTopicError;
  }

  if (revision !== null) {
    const { error: updateRevisionError } = await supabase
      .from("topic_bundle_revisions")
      .update({
        verification_status: status,
        last_reviewed_at: now,
      })
      .eq("topic_slug", topicSlug)
      .eq("revision", revision);

    if (updateRevisionError) {
      throw updateRevisionError;
    }
  }

  return {
    topicSlug,
    status,
    updatedAt: now,
  };
}
