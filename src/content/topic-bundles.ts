import { topics as legacyTopics } from "@/lib/data/seed";
import { createDefaultTopicBundleReview } from "@/content/topic-bundle-review-metadata";
import type { Topic, TopicBundle } from "@/lib/domain";

export const topicBundles: TopicBundle[] = legacyTopics.map((topic) => ({
  topic,
  review: createDefaultTopicBundleReview(topic.slug),
}));

export function materializeTopic(bundle: TopicBundle): Topic {
  return {
    ...bundle.topic,
    verificationStatus: bundle.review.verificationStatus,
    sourceOrigin: bundle.review.sourceOrigin,
    revision: bundle.review.revision,
    importedAt: bundle.review.importedAt,
    lastReviewedAt: bundle.review.lastReviewedAt,
    editorialSummary: bundle.review.editorialSummary,
  };
}

export const bundledTopics: Topic[] = topicBundles.map(materializeTopic);

export function topicToBundle(topic: Topic): TopicBundle {
  const {
    verificationStatus = "generated",
    sourceOrigin = "manual-edit",
    revision = 1,
    importedAt = new Date().toISOString(),
    lastReviewedAt,
    editorialSummary = "운영 메모가 아직 없습니다.",
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

export function getTopicBundleBySlug(slug: string): TopicBundle | null {
  return topicBundles.find((bundle) => bundle.topic.slug === slug) ?? null;
}
