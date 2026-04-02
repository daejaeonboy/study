"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { AdminTopicStatusActions } from "@/components/admin/admin-topic-status-actions";
import type { AdminTopicSummaryRecord, EditorialUser, VerificationStatus } from "@/lib/domain";
import { formatReviewTaskStatus, formatVerificationStatus } from "@/lib/utils";

const statusOptions: Array<VerificationStatus | "all"> = [
  "all",
  "generated",
  "reviewing",
  "verified",
  "published",
  "deprecated",
];

function formatTimestamp(value?: string) {
  if (!value) {
    return "기록 없음";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AdminTopicsView({
  currentUser,
  records,
  users,
}: {
  currentUser: EditorialUser;
  records: AdminTopicSummaryRecord[];
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
      record.assignee?.displayName ?? "",
      ...(record.topic.tags ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery);
  });

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div className="stack" style={{ gap: "6px" }}>
          <h1 className="admin-page__title">Topic</h1>
          <p className="caption">{filteredRecords.length}개 표시</p>
        </div>
      </header>

      <section className="admin-toolbar">
        <input
          className="plain-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제목, slug, 태그, 담당자"
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
      </section>

      <section className="admin-section">
        <div className="admin-table admin-table--topics">
          <div className="admin-table__head">
            <span>Topic</span>
            <span>상태</span>
            <span>담당</span>
            <span>최근 변경</span>
            <span>액션</span>
          </div>

          {filteredRecords.length ? (
            filteredRecords.map((record) => {
              const topicStatus = record.topic.verificationStatus ?? "generated";

              return (
                <article key={record.topic.slug} className="admin-table__row">
                  <div className="admin-table__topic">
                    <strong>{record.topic.title}</strong>
                    <span>
                      {record.topic.slug} · {record.topic.category}
                    </span>
                  </div>

                  <div className="admin-table__cell">
                    <strong>{formatVerificationStatus(topicStatus)}</strong>
                    <span>
                      {record.latestReviewTask
                        ? formatReviewTaskStatus(record.latestReviewTask.status)
                        : "검수 기록 없음"}
                    </span>
                  </div>

                  <div className="admin-table__cell">
                    <strong>{record.assignee?.displayName ?? "미할당"}</strong>
                    <span>{record.assignment?.note ?? "메모 없음"}</span>
                  </div>

                  <div className="admin-table__cell">
                    <strong>{formatTimestamp(record.topic.lastReviewedAt ?? record.topic.importedAt)}</strong>
                    <span>r{record.topic.revision ?? 1}</span>
                  </div>

                  <div className="admin-table__actions">
                    <AdminTopicStatusActions
                      slug={record.topic.slug}
                      currentStatus={topicStatus}
                      currentUserRole={currentUser.role}
                    />
                    <Link href={`/admin/topics/${record.topic.slug}`} className="btn btn-secondary btn-sm">
                      상세
                    </Link>
                    <Link href={`/admin/topics/${record.topic.slug}/edit`} className="btn btn-primary btn-sm">
                      편집
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="admin-empty">조건에 맞는 Topic이 없습니다.</div>
          )}
        </div>
      </section>
    </section>
  );
}
