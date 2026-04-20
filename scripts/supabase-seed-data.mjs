import { createDefaultTopicBundleReview } from "../src/content/topic-bundle-review-metadata.ts";

const DEPTHS = ["light", "core", "deep"];
const learningTimeByDepth = {
  light: 3,
  core: 8,
  deep: 15,
};

export function getImportMode({ dryRun, existingSeedTopicCount, force }) {
  if (dryRun) {
    return "dry-run";
  }

  if (existingSeedTopicCount > 0 && !force) {
    throw new Error(
      `Refusing to overwrite ${existingSeedTopicCount} existing seed topic(s). Re-run with --force if you intentionally want to refresh seed projections.`,
    );
  }

  return force ? "force" : "initial";
}

export function shouldDeleteExistingProjections(mode) {
  return mode === "force";
}

function normalizeTopicStatus(topic) {
  if (topic.verificationStatus === "published") {
    return "published";
  }

  if (topic.verificationStatus === "deprecated") {
    return "archived";
  }

  return "draft";
}

function normalizeSourceType(sourceType) {
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

function normalizeDifficultyLevel(difficulty) {
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

function clampTrustScore(value) {
  if (!Number.isFinite(value)) {
    return 3;
  }

  return Math.min(5, Math.max(1, Math.round(value)));
}

function getTopicId(topicIdsBySlug, slug) {
  return topicIdsBySlug.get(slug) ?? null;
}

export function materializeSeedTopic(topic) {
  const review = createDefaultTopicBundleReview(topic.slug);

  return {
    ...topic,
    verificationStatus: review.verificationStatus,
    sourceOrigin: review.sourceOrigin,
    revision: review.revision,
    importedAt: review.importedAt,
    lastReviewedAt: review.lastReviewedAt,
    editorialSummary: review.editorialSummary,
  };
}

export function topicToBundle(topic) {
  const {
    verificationStatus = "generated",
    sourceOrigin = "legacy-seed",
    revision = 1,
    importedAt = new Date().toISOString(),
    lastReviewedAt,
    editorialSummary = "자동 적재된 원본입니다. 아직 운영 검토를 거치지 않았습니다.",
    ...topicDraft
  } = topic;

  return {
    topic: topicDraft,
    review: {
      verificationStatus,
      sourceOrigin,
      revision,
      importedAt,
      lastReviewedAt,
      editorialSummary,
    },
  };
}

export function buildTopicRows(topics) {
  return topics.map((topic) => ({
    slug: topic.slug,
    title: topic.title,
    summary: topic.summary,
    importance_reason: topic.importance,
    category: topic.category,
    tags: topic.tags,
    status: normalizeTopicStatus(topic),
    verification_status: topic.verificationStatus ?? "generated",
    source_origin: topic.sourceOrigin ?? "legacy-seed",
    revision: topic.revision ?? 1,
    imported_at: topic.importedAt,
    last_reviewed_at: topic.lastReviewedAt ?? null,
    editorial_summary: topic.editorialSummary ?? null,
  }));
}

export function buildRevisionRows(topics) {
  return topics.map((topic) => ({
    topic_slug: topic.slug,
    revision: topic.revision ?? 1,
    verification_status: topic.verificationStatus ?? "generated",
    source_origin: topic.sourceOrigin ?? "legacy-seed",
    editorial_summary: topic.editorialSummary ?? null,
    bundle_payload: topicToBundle(topic),
    imported_at: topic.importedAt,
    last_reviewed_at: topic.lastReviewedAt ?? null,
  }));
}

export function buildLayerRows(topicIdsBySlug, topics) {
  return topics.flatMap((topic) => {
    const topicId = getTopicId(topicIdsBySlug, topic.slug);

    if (!topicId) {
      return [];
    }

    return DEPTHS.map((depth) => ({
      topic_id: topicId,
      depth,
      title: topic.layers[depth].title,
      learning_time_minutes: learningTimeByDepth[depth],
      body_markdown: topic.layers[depth].body.join("\n\n"),
      key_takeaways: topic.layers[depth].keyIdeas,
      bridge_prompt: topic.layers[depth].bridgePrompt,
    }));
  });
}

export function buildSourceRows(topicIdsBySlug, topics) {
  return topics.flatMap((topic) => {
    const topicId = getTopicId(topicIdsBySlug, topic.slug);

    if (!topicId) {
      return [];
    }

    return topic.sources.map((source) => ({
      topic_id: topicId,
      title: source.title,
      source_type: normalizeSourceType(source.type),
      url: source.url,
      publisher: source.publisher,
      difficulty_level: normalizeDifficultyLevel(source.difficulty),
      trust_score: clampTrustScore(source.trust),
      short_summary: source.summary,
    }));
  });
}

export function buildRelationRows(topicIdsBySlug, topics) {
  return topics.flatMap((topic) => {
    const fromTopicId = getTopicId(topicIdsBySlug, topic.slug);

    if (!fromTopicId) {
      return [];
    }

    const relationCandidates = [
      ...topic.prerequisites.map((slug) => ({
        slug,
        relation_type: "prerequisite",
        reason_text: "운영 편집본에서 지정한 선수지식입니다.",
      })),
      ...topic.related.map((slug) => ({
        slug,
        relation_type: "related",
        reason_text: "운영 편집본에서 지정한 관련 Topic입니다.",
      })),
      ...topic.crossDomainLinks.map((link) => ({
        slug: link.topicSlug,
        relation_type: "cross_domain",
        reason_text: `${link.label}: ${link.reason}`,
      })),
    ];

    return relationCandidates.flatMap((relation) => {
      const toTopicId = getTopicId(topicIdsBySlug, relation.slug);

      if (!toTopicId) {
        return [];
      }

      return {
        from_topic_id: fromTopicId,
        to_topic_id: toTopicId,
        relation_type: relation.relation_type,
        reason_text: relation.reason_text,
      };
    });
  });
}
