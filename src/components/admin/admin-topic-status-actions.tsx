"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { EditorialRole, VerificationStatus } from "@/lib/domain";

type ActionDefinition = {
  label: string;
  status: VerificationStatus;
  tone: "primary" | "secondary";
};

function getStatusActions(
  role: EditorialRole,
  currentStatus: VerificationStatus,
): ActionDefinition[] {
  if (role !== "admin" && role !== "reviewer") {
    return [];
  }

  if (currentStatus === "generated") {
    return [{ label: "검토중", status: "reviewing", tone: "secondary" }];
  }

  if (currentStatus === "reviewing") {
    return [{ label: "검증 완료", status: "verified", tone: "primary" }];
  }

  if (currentStatus === "verified") {
    return role === "admin"
      ? [
          { label: "다시 검토", status: "reviewing", tone: "secondary" },
          { label: "게시", status: "published", tone: "primary" },
        ]
      : [{ label: "다시 검토", status: "reviewing", tone: "secondary" }];
  }

  if (currentStatus === "published") {
    return role === "admin"
      ? [{ label: "보관", status: "deprecated", tone: "secondary" }]
      : [];
  }

  if (currentStatus === "deprecated") {
    return role === "admin"
      ? [{ label: "다시 게시", status: "published", tone: "primary" }]
      : [];
  }

  return [];
}

export function AdminTopicStatusActions({
  slug,
  currentStatus,
  currentUserRole,
}: {
  slug: string;
  currentStatus: VerificationStatus;
  currentUserRole: EditorialRole;
}) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<VerificationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actions = useMemo(
    () => getStatusActions(currentUserRole, currentStatus),
    [currentStatus, currentUserRole],
  );

  if (!actions.length) {
    return null;
  }

  async function handleStatusChange(status: VerificationStatus) {
    setPendingStatus(status);
    setError(null);

    try {
      const response = await fetch(`/api/admin/topics/${slug}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "상태 변경에 실패했습니다.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "상태 변경에 실패했습니다.");
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
          onClick={() => handleStatusChange(action.status)}
          disabled={pendingStatus !== null}
        >
          {pendingStatus === action.status ? "처리 중..." : action.label}
        </button>
      ))}
      {error ? <span className="caption">{error}</span> : null}
    </div>
  );
}
