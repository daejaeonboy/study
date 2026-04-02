"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { EditorialRole, ReviewTaskStatus } from "@/lib/domain";

type ActionDefinition = {
  label: string;
  status: ReviewTaskStatus;
  tone: "primary" | "secondary";
};

function getReviewActions(
  role: EditorialRole,
  currentStatus: ReviewTaskStatus,
): ActionDefinition[] {
  if (role !== "admin" && role !== "reviewer") {
    return [];
  }

  if (currentStatus === "pending") {
    return [
      { label: "검토중", status: "in_review", tone: "secondary" },
      { label: "승인", status: "approved", tone: "primary" },
      { label: "수정 요청", status: "changes_requested", tone: "secondary" },
    ];
  }

  if (currentStatus === "in_review") {
    return [
      { label: "승인", status: "approved", tone: "primary" },
      { label: "수정 요청", status: "changes_requested", tone: "secondary" },
    ];
  }

  if (currentStatus === "changes_requested") {
    return [{ label: "다시 검토", status: "in_review", tone: "secondary" }];
  }

  return [];
}

export function AdminReviewActions({
  topicSlug,
  currentStatus,
  currentUserRole,
}: {
  topicSlug: string;
  currentStatus: ReviewTaskStatus;
  currentUserRole: EditorialRole;
}) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<ReviewTaskStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actions = useMemo(
    () => getReviewActions(currentUserRole, currentStatus),
    [currentStatus, currentUserRole],
  );

  if (!actions.length) {
    return null;
  }

  async function handleReviewStatus(status: ReviewTaskStatus) {
    setPendingStatus(status);
    setError(null);

    try {
      const response = await fetch(`/api/admin/topics/${topicSlug}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "검수 상태 저장에 실패했습니다.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "검수 상태 저장에 실패했습니다.");
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="admin-inline-actions">
      {actions.map((action) => (
        <button
          key={action.status}
          type="button"
          className={`btn ${action.tone === "primary" ? "btn-primary" : "btn-secondary"} btn-sm`}
          onClick={() => handleReviewStatus(action.status)}
          disabled={pendingStatus !== null}
        >
          {pendingStatus === action.status ? "처리 중..." : action.label}
        </button>
      ))}
      {error ? <span className="caption">{error}</span> : null}
    </div>
  );
}
