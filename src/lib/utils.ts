import type { EditorialRole, LayerDepth, ReviewTaskStatus, VerificationStatus } from "@/lib/domain";

export function formatDepth(depth: LayerDepth) {
  return { light: "Light", core: "Core", deep: "Deep" }[depth] ?? depth;
}

export function formatVerificationStatus(status: VerificationStatus) {
  return {
    generated: "자동 초안",
    reviewing: "검토 대기",
    verified: "검증 완료",
    published: "게시 중",
    deprecated: "보관됨",
  }[status];
}

export function formatEditorialRole(role: EditorialRole) {
  return {
    admin: "운영 관리자",
    editor: "콘텐츠 편집",
    reviewer: "검수 담당",
  }[role];
}

export function formatReviewTaskStatus(status: ReviewTaskStatus) {
  return {
    pending: "검토 대기",
    in_review: "검토 중",
    changes_requested: "수정 요청",
    approved: "승인 완료",
  }[status];
}
