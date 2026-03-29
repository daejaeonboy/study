import type { EditorialUser, TopicAssignment, TopicReviewTask } from "@/lib/domain";

export const editorialUsers: EditorialUser[] = [
  {
    id: "ops-admin",
    displayName: "한지민",
    email: "admin@ikl.local",
    role: "admin",
  },
  {
    id: "ops-editor",
    displayName: "박서준",
    email: "editor@ikl.local",
    role: "editor",
  },
  {
    id: "ops-reviewer",
    displayName: "김도윤",
    email: "reviewer@ikl.local",
    role: "reviewer",
  },
];

export const currentEditorialUserId = "ops-admin";

export const topicAssignments: TopicAssignment[] = [
  {
    topicSlug: "black-hole",
    assigneeId: "ops-editor",
    assignedById: "ops-admin",
    assignedAt: "2026-03-28T10:00:00+09:00",
    note: "입문/심화 연결 문장 보강 필요",
  },
  {
    topicSlug: "philosophy-of-science",
    assigneeId: "ops-reviewer",
    assignedById: "ops-admin",
    assignedAt: "2026-03-28T14:30:00+09:00",
    note: "검수 우선순위 상위",
  },
  {
    topicSlug: "french-revolution",
    assigneeId: "ops-editor",
    assignedById: "ops-admin",
    assignedAt: "2026-03-27T16:00:00+09:00",
    note: "민주주의 브리지 개념 정리",
  },
];

export const topicReviewTasks: TopicReviewTask[] = [
  {
    id: "review-black-hole-1",
    topicSlug: "black-hole",
    status: "in_review",
    requesterId: "ops-editor",
    reviewerId: "ops-reviewer",
    requestedAt: "2026-03-28T18:00:00+09:00",
    comment: "관측 근거 문장과 과학철학 브리지 연결 검토 중",
  },
  {
    id: "review-philosophy-1",
    topicSlug: "philosophy-of-science",
    status: "pending",
    requesterId: "ops-editor",
    reviewerId: "ops-reviewer",
    requestedAt: "2026-03-29T09:30:00+09:00",
    comment: "대표 철학자 설명 밀도 확인 필요",
  },
  {
    id: "review-french-1",
    topicSlug: "french-revolution",
    status: "changes_requested",
    requesterId: "ops-editor",
    reviewerId: "ops-admin",
    requestedAt: "2026-03-27T19:00:00+09:00",
    reviewedAt: "2026-03-28T09:10:00+09:00",
    comment: "사건 설명은 충분하지만 민주주의와의 연결 논리 보강 필요",
  },
  {
    id: "review-democracy-1",
    topicSlug: "democracy",
    status: "approved",
    requesterId: "ops-editor",
    reviewerId: "ops-admin",
    requestedAt: "2026-03-26T11:00:00+09:00",
    reviewedAt: "2026-03-26T18:40:00+09:00",
    comment: "게시 가능",
  },
];
