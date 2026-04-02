import Link from "next/link";

import { AdminTopicControls } from "@/components/admin/admin-topic-controls";
import { AdminTopicStatusActions } from "@/components/admin/admin-topic-status-actions";
import type { AdminTopicRecord, EditorialUser } from "@/lib/domain";
import {
  formatReviewTaskStatus,
  formatVerificationStatus,
} from "@/lib/utils";

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

export function AdminTopicDetailView({
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
  const { topic, assignee, assignedBy, assignment, latestReviewTask } = record;

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div className="stack" style={{ gap: "10px", maxWidth: "860px" }}>
          <div className="chip-row">
            <span className="chip chip--alt">{topic.category}</span>
            <span className="chip">{formatVerificationStatus(topic.verificationStatus ?? "generated")}</span>
            <span className="chip">r{topic.revision ?? 1}</span>
          </div>

          <h1 className="admin-page__title">{topic.title}</h1>
          {topic.summary ? <p className="admin-page__lead">{topic.summary}</p> : null}
        </div>

        <div className="admin-page__actions">
          <Link href={`/admin/topics/${encodeURIComponent(topic.slug)}/edit`} className="btn btn-primary">
            편집
          </Link>
          <Link href={`/topic/${topic.slug}`} className="btn btn-secondary">
            사용자 화면
          </Link>
        </div>
      </header>

      <div className="admin-detail">
        <section className="admin-section">
          <div className="admin-detail__grid">
            <article className="admin-detail-card">
              <span>상태</span>
              <strong>{formatVerificationStatus(topic.verificationStatus ?? "generated")}</strong>
              <AdminTopicStatusActions
                slug={topic.slug}
                currentStatus={topic.verificationStatus ?? "generated"}
                currentUserRole={currentUser.role}
              />
            </article>

            <article className="admin-detail-card">
              <span>담당</span>
              <strong>{assignee?.displayName ?? "미할당"}</strong>
              <p>
                {assignedBy ? `배정 ${assignedBy.displayName}` : "배정 기록 없음"}
                {assignment?.note ? ` · ${assignment.note}` : ""}
              </p>
            </article>

            <article className="admin-detail-card">
              <span>검수</span>
              <strong>{latestReviewTask ? formatReviewTaskStatus(latestReviewTask.status) : "요청 없음"}</strong>
              <p>{formatTimestamp(latestReviewTask?.requestedAt ?? topic.lastReviewedAt)}</p>
            </article>

            <article className="admin-detail-card">
              <span>구성</span>
              <strong>
                출처 {topic.sources.length} · 선수 {topic.prerequisites.length} · 연결 {topic.related.length}
              </strong>
              <p>{formatTimestamp(topic.lastReviewedAt ?? topic.importedAt)}</p>
            </article>
          </div>

          <article className="admin-detail-card">
            <span>운영 메모</span>
            <strong>{topic.editorialSummary?.trim() ? "메모 있음" : "메모 없음"}</strong>
            <p>{topic.editorialSummary?.trim() || "기록된 메모가 없습니다."}</p>
          </article>
        </section>

        <aside className="stack" style={{ gap: "var(--space-4)" }}>
          <AdminTopicControls
            record={record}
            currentUser={currentUser}
            users={users}
            remotePersistenceEnabled={remotePersistenceEnabled}
          />
          <Link href="/admin/topics" className="btn btn-secondary btn-block" style={{ textAlign: "center" }}>
            Topic 목록
          </Link>
        </aside>
      </div>
    </section>
  );
}
