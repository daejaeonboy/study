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
      setNotice("담당자를 선택하세요.");
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
        throw new Error(payload?.error ?? "담당 저장에 실패했습니다.");
      }

      setNotice("담당 저장됨");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "담당 저장에 실패했습니다.");
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
        throw new Error(payload?.error ?? "검수 저장에 실패했습니다.");
      }

      setNotice("검수 저장됨");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "검수 저장에 실패했습니다.");
    } finally {
      setIsSavingReview(false);
    }
  }

  return (
    <section className="admin-panel">
      {!remotePersistenceEnabled ? (
        <div className="admin-panel__notice">공유 저장 비활성</div>
      ) : null}

      <div className="admin-panel__group">
        <h2>담당</h2>
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
          placeholder="메모"
          style={{ minHeight: "88px" }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleAssignmentSave}
          disabled={!canAssign || isSavingAssignment || !remotePersistenceEnabled}
        >
          {isSavingAssignment ? "저장 중..." : "저장"}
        </button>
      </div>

      <div className="admin-panel__group">
        <h2>검수</h2>
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
          placeholder="코멘트"
          style={{ minHeight: "104px" }}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleReviewSave}
          disabled={!canReview || isSavingReview || !remotePersistenceEnabled}
        >
          {isSavingReview ? "저장 중..." : "저장"}
        </button>
      </div>

      {notice ? <span className="caption">{notice}</span> : null}
    </section>
  );
}
