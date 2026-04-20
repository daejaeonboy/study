import type { TopicBundleReview } from "@/lib/domain";

export const LEGACY_IMPORT_TIMESTAMP = "2026-03-29T00:00:00+09:00";

const legacyReviewBySlug: Record<string, Omit<TopicBundleReview, "importedAt">> = {
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

export function createDefaultTopicBundleReview(slug: string): TopicBundleReview {
  const saved = legacyReviewBySlug[slug];

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
