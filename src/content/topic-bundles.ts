import { topics as legacyTopics } from "@/lib/data/seed";
import type { Topic, TopicBundle, TopicBundleReview } from "@/lib/domain";

const LEGACY_IMPORT_TIMESTAMP = "2026-03-29T00:00:00+09:00";

const bundleReviewBySlug: Record<
  string,
  Omit<TopicBundleReview, "importedAt">
> = {
  "black-hole": {
    verificationStatus: "reviewing",
    sourceOrigin: "legacy-seed",
    revision: 1,
    editorialSummary: "기존 시드 원본을 우선 적재한 상태입니다. 운영자 검토가 아직 끝나지 않았습니다.",
  },
  gravity: {
    verificationStatus: "reviewing",
    sourceOrigin: "legacy-seed",
    revision: 1,
    editorialSummary: "기존 시드 원본을 우선 적재한 상태입니다. 운영자 검토가 아직 끝나지 않았습니다.",
  },
  spacetime: {
    verificationStatus: "reviewing",
    sourceOrigin: "legacy-seed",
    revision: 1,
    editorialSummary: "기존 시드 원본을 우선 적재한 상태입니다. 운영자 검토가 아직 끝나지 않았습니다.",
  },
  "general-relativity": {
    verificationStatus: "reviewing",
    sourceOrigin: "legacy-seed",
    revision: 1,
    editorialSummary: "기존 시드 원본을 우선 적재한 상태입니다. 운영자 검토가 아직 끝나지 않았습니다.",
  },
  "scientific-revolution": {
    verificationStatus: "reviewing",
    sourceOrigin: "legacy-seed",
    revision: 1,
    editorialSummary: "기존 시드 원본을 우선 적재한 상태입니다. 운영자 검토가 아직 끝나지 않았습니다.",
  },
  "philosophy-of-science": {
    verificationStatus: "reviewing",
    sourceOrigin: "legacy-seed",
    revision: 1,
    editorialSummary: "기존 시드 원본을 우선 적재한 상태입니다. 운영자 검토가 아직 끝나지 않았습니다.",
  },
  "french-revolution": {
    verificationStatus: "reviewing",
    sourceOrigin: "legacy-seed",
    revision: 1,
    editorialSummary: "기존 시드 원본을 우선 적재한 상태입니다. 운영자 검토가 아직 끝나지 않았습니다.",
  },
  democracy: {
    verificationStatus: "reviewing",
    sourceOrigin: "legacy-seed",
    revision: 1,
    editorialSummary: "기존 시드 원본을 우선 적재한 상태입니다. 운영자 검토가 아직 끝나지 않았습니다.",
  },
};

function createDefaultReview(slug: string): TopicBundleReview {
  const saved = bundleReviewBySlug[slug];

  if (saved) {
    return {
      ...saved,
      importedAt: LEGACY_IMPORT_TIMESTAMP,
    };
  }

  return {
    verificationStatus: "generated",
    sourceOrigin: "legacy-seed",
    revision: 1,
    importedAt: LEGACY_IMPORT_TIMESTAMP,
    editorialSummary: "자동 적재된 원본입니다. 아직 운영 검토를 거치지 않았습니다.",
  };
}

export const topicBundles: TopicBundle[] = legacyTopics.map((topic) => ({
  topic,
  review: createDefaultReview(topic.slug),
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
