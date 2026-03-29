"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import type { AdminTopicRecord, EditorialUser, VerificationStatus } from "@/lib/domain";
import { formatReviewTaskStatus, formatVerificationStatus } from "@/lib/utils";

const statusOptions: Array<VerificationStatus | "all"> = [
  "all",
  "generated",
  "reviewing",
  "verified",
  "published",
  "deprecated",
];

export function AdminTopicsView({
  records,
  users,
}: {
  records: AdminTopicRecord[];
  users: EditorialUser[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredRecords = records.filter((record) => {
    const topicStatus = record.topic.verificationStatus ?? "generated";

    if (statusFilter !== "all" && topicStatus !== statusFilter) {
      return false;
    }

    if (assigneeFilter !== "all") {
      if (assigneeFilter === "unassigned") {
        if (record.assignee) {
          return false;
        }
      } else if (record.assignee?.id !== assigneeFilter) {
        return false;
      }
    }

    if (!deferredQuery) {
      return true;
    }

    return [
      record.topic.title,
      record.topic.slug,
      record.topic.category,
      record.topic.summary,
      record.assignee?.displayName ?? "",
      ...(record.topic.tags ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery);
  });

  return (
    <section className="view">
      <header className="stack" style={{ gap: "var(--space-6)" }}>
        <div className="stack" style={{ gap: "var(--space-4)" }}>
          <span className="caption" style={{ color: "var(--accent)" }}>
            TOPIC OPERATIONS
          </span>
          <h1 className="hero-title">운영 Topic 목록</h1>
          <p className="hero-copy" style={{ maxWidth: "880px" }}>
            상태, 담당자, 최근 검수 흐름을 기준으로 Topic을 정렬하고 운영 상세로 진입하는
            화면입니다.
          </p>
        </div>

        <div
          className="surface-elevated"
          style={{
            padding: "var(--space-6)",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "var(--space-4)",
          }}
        >
          <input
            className="plain-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="제목, slug, 태그, 담당자 검색"
          />

          <select
            className="plain-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as VerificationStatus | "all")}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "전체 상태" : formatVerificationStatus(status)}
              </option>
            ))}
          </select>

          <select
            className="plain-input"
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
          >
            <option value="all">전체 담당자</option>
            <option value="unassigned">미할당</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="stack" style={{ gap: "var(--space-3)", marginTop: "var(--space-8)" }}>
        {filteredRecords.map((record) => (
          <article
            key={record.topic.slug}
            className="surface card-interactive"
            style={{ padding: "var(--space-6)" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2.1fr 1fr 1fr 1.2fr auto",
                gap: "var(--space-4)",
                alignItems: "center",
              }}
            >
              <div className="stack" style={{ gap: "var(--space-2)" }}>
                <div className="chip-row">
                  <span className="chip chip--alt">{record.topic.category}</span>
                  <span className="chip">
                    {formatVerificationStatus(record.topic.verificationStatus ?? "generated")}
                  </span>
                </div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-strong)" }}>
                  {record.topic.title}
                </strong>
                <p className="muted" style={{ fontSize: "0.9rem" }}>
                  {record.topic.summary}
                </p>
              </div>

              <div className="stack" style={{ gap: "var(--space-1)" }}>
                <span className="caption">담당</span>
                <strong>{record.assignee?.displayName ?? "미할당"}</strong>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {record.assignment?.note ?? "할당 메모 없음"}
                </span>
              </div>

              <div className="stack" style={{ gap: "var(--space-1)" }}>
                <span className="caption">최근 검수</span>
                <strong>
                  {record.latestReviewTask
                    ? formatReviewTaskStatus(record.latestReviewTask.status)
                    : "없음"}
                </strong>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  r{record.topic.revision ?? 1}
                </span>
              </div>

              <div className="stack" style={{ gap: "var(--space-1)" }}>
                <span className="caption">관련 태그</span>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  {record.topic.tags.join(", ")}
                </span>
              </div>

              <div className="hero-actions" style={{ justifyContent: "flex-end" }}>
                <Link href={`/admin/topics/${record.topic.slug}`} className="btn btn-secondary">
                  운영 상세
                </Link>
                <Link href={`/admin/topics/${record.topic.slug}/edit`} className="btn btn-primary">
                  Topic 편집
                </Link>
              </div>
            </div>
          </article>
        ))}

        {!filteredRecords.length ? (
          <div className="surface" style={{ padding: "var(--space-10)", textAlign: "center" }}>
            <p className="muted">조건에 맞는 Topic이 없습니다.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
