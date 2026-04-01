"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AdminTopicRecord, EditorialUser, ReviewTaskStatus } from "@/lib/domain";
import { canManageAssignments, canManageReviews } from "@/lib/editorial-permissions";
import { formatReviewTaskStatus } from "@/lib/utils";

const reviewStatuses: ReviewTaskStatus[] = [
  "pending",
  "in_review",
  "changes_requested",
  "approved",
];

export function AdminTopicControls({
  record,
  currentUser,
  users,
  remotePersistenceEnabled,
}: {
  record: AdminTopicRecord;
  currentUser: EditorialUser;
  users: EditorialUser[];
  remotePersistenceEnabled: boolean;
}) {
  const router = useRouter();
  const [assignmentNote, setAssignmentNote] = useState(record.assignment?.note ?? "");
  const [assigneeId, setAssigneeId] = useState(record.assignment?.assigneeId ?? "");
  const [reviewStatus, setReviewStatus] = useState<ReviewTaskStatus>(
    record.latestReviewTask?.status ?? "pending",
  );
  const [reviewerId, setReviewerId] = useState(record.latestReviewTask?.reviewerId ?? currentUser.id);
  const [reviewComment, setReviewComment] = useState(record.latestReviewTask?.comment ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const canAssign = canManageAssignments(currentUser.role);
  const canReview = canManageReviews(currentUser.role);
  const reviewerCandidates = useMemo(
    () => users.filter((user) => user.role === "reviewer" || user.role === "admin"),
    [users],
  );

  async function handleAssignmentSave() {
    if (!assigneeId) {
      setNotice("담당자를 먼저 선택해야 합니다.");
      return;
    }

    setIsSavingAssignment(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/topics/${record.topic.slug}/assignment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigneeId,
          note: assignmentNote,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "담당자 저장에 실패했습니다.");
      }

      setNotice("담당자 배정을 저장했습니다.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "담당자 저장에 실패했습니다.");
    } finally {
      setIsSavingAssignment(false);
    }
  }

  async function handleReviewSave() {
    setIsSavingReview(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/topics/${record.topic.slug}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: reviewStatus,
          reviewerId,
          comment: reviewComment,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "검수 상태 저장에 실패했습니다.");
      }

      setNotice("검수 상태를 저장했습니다.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "검수 상태 저장에 실패했습니다.");
    } finally {
      setIsSavingReview(false);
    }
  }

  return (
    <section className="surface-elevated" style={{ padding: "var(--space-6)" }}>
      <div className="section-head">
        <h2 className="section-title">운영 액션</h2>
      </div>

      <div className="stack" style={{ gap: "var(--space-6)", marginTop: "var(--space-5)" }}>
        {!remotePersistenceEnabled ? (
          <div className="surface" style={{ padding: "var(--space-4)", border: "1px solid var(--line)" }}>
            <p className="muted">
              `SUPABASE_SERVICE_ROLE_KEY`가 없어서 실제 공유 저장은 아직 비활성화 상태입니다.
            </p>
          </div>
        ) : null}

        <div className="stack" style={{ gap: "var(--space-4)" }}>
          <span className="caption">담당자 배정</span>
          <select
            className="plain-input"
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
            disabled={!canAssign || isSavingAssignment || !remotePersistenceEnabled}
          >
            <option value="">담당자 선택</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
          </select>
          <textarea
            className="plain-input"
            value={assignmentNote}
            onChange={(event) => setAssignmentNote(event.target.value)}
            disabled={!canAssign || isSavingAssignment || !remotePersistenceEnabled}
            placeholder="할당 메모"
            style={{ minHeight: "108px" }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAssignmentSave}
            disabled={!canAssign || isSavingAssignment || !remotePersistenceEnabled}
          >
            {isSavingAssignment ? "저장 중..." : "담당자 저장"}
          </button>
        </div>

        <div className="stack" style={{ gap: "var(--space-4)" }}>
          <span className="caption">검수 상태</span>
          <select
            className="plain-input"
            value={reviewStatus}
            onChange={(event) => setReviewStatus(event.target.value as ReviewTaskStatus)}
            disabled={!canReview || isSavingReview || !remotePersistenceEnabled}
          >
            {reviewStatuses.map((status) => (
              <option key={status} value={status}>
                {formatReviewTaskStatus(status)}
              </option>
            ))}
          </select>
          <select
            className="plain-input"
            value={reviewerId}
            onChange={(event) => setReviewerId(event.target.value)}
            disabled={!canReview || isSavingReview || !remotePersistenceEnabled}
          >
            {reviewerCandidates.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
          </select>
          <textarea
            className="plain-input"
            value={reviewComment}
            onChange={(event) => setReviewComment(event.target.value)}
            disabled={!canReview || isSavingReview || !remotePersistenceEnabled}
            placeholder="검수 코멘트"
            style={{ minHeight: "132px" }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleReviewSave}
            disabled={!canReview || isSavingReview || !remotePersistenceEnabled}
          >
            {isSavingReview ? "저장 중..." : "검수 상태 저장"}
          </button>
        </div>

        {notice ? <span className="caption">{notice}</span> : null}
      </div>
    </section>
  );
}
