import Link from "next/link";

import { AdminTopicControls } from "@/components/admin/admin-topic-controls";
import type { AdminTopicRecord, EditorialUser } from "@/lib/domain";
import {
  formatEditorialRole,
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
    <section className="view">
      <header className="stack" style={{ gap: "var(--space-6)" }}>
        <div className="chip-row">
          <span className="chip chip--alt">{topic.category}</span>
          <span className="chip">
            {formatVerificationStatus(topic.verificationStatus ?? "generated")}
          </span>
          <span className="chip">r{topic.revision ?? 1}</span>
        </div>

        <div className="stack" style={{ gap: "var(--space-4)" }}>
          <h1 className="hero-title">{topic.title}</h1>
          <p className="hero-copy" style={{ maxWidth: "880px" }}>
            {topic.summary}
          </p>
          <p className="muted" style={{ maxWidth: "880px" }}>
            {topic.editorialSummary ?? "운영 메모가 아직 없습니다."}
          </p>
        </div>

        <div className="hero-actions">
          <Link href={`/admin/topics/${encodeURIComponent(topic.slug)}/edit`} className="btn btn-primary">
            이 Topic 편집
          </Link>
          <Link href={`/topic/${topic.slug}`} className="btn btn-secondary">
            사용자 화면 보기
          </Link>
          <Link href="/admin/review-queue" className="btn btn-secondary">
            검수 큐로 이동
          </Link>
        </div>
      </header>

      <div className="feature-grid" style={{ marginTop: "var(--space-8)" }}>
        <section className="stack" style={{ gap: "var(--space-6)" }}>
          <div className="section-head">
            <h2 className="section-title">운영 컨텍스트</h2>
          </div>

          <div className="grid-2">
            <article className="surface" style={{ padding: "var(--space-6)" }}>
              <span className="caption">담당자</span>
              <strong style={{ display: "block", marginTop: "8px", fontSize: "1.05rem" }}>
                {assignee?.displayName ?? "미할당"}
              </strong>
              <p className="muted" style={{ marginTop: "8px" }}>
                배정자 {assignedBy?.displayName ?? "기록 없음"}
              </p>
              <p className="muted">{assignment?.note ?? "할당 메모 없음"}</p>
              <p className="caption" style={{ marginTop: "8px" }}>
                할당 시각 {formatTimestamp(assignment?.assignedAt)}
              </p>
            </article>

            <article className="surface-elevated" style={{ padding: "var(--space-6)" }}>
              <span className="caption">최근 검수 작업</span>
              <strong style={{ display: "block", marginTop: "8px", fontSize: "1.05rem" }}>
                {latestReviewTask
                  ? formatReviewTaskStatus(latestReviewTask.status)
                  : "검수 요청 없음"}
              </strong>
              <p className="muted" style={{ marginTop: "8px" }}>
                {latestReviewTask?.comment ?? "최근 검수 코멘트가 없습니다."}
              </p>
              <p className="caption" style={{ marginTop: "8px" }}>
                최근 요청 {formatTimestamp(latestReviewTask?.requestedAt)}
              </p>
            </article>
          </div>

          <article className="surface" style={{ padding: "var(--space-6)" }}>
            <div className="section-head">
              <h2 className="section-title">운영 체크포인트</h2>
            </div>
            <div className="grid-3" style={{ marginTop: "var(--space-5)" }}>
              <div className="surface" style={{ padding: "var(--space-5)", background: "var(--bg-subtle)" }}>
                <span className="caption">선수지식</span>
                <strong style={{ display: "block", marginTop: "8px" }}>{topic.prerequisites.length}</strong>
              </div>
              <div className="surface" style={{ padding: "var(--space-5)", background: "var(--bg-subtle)" }}>
                <span className="caption">관련 Topic</span>
                <strong style={{ display: "block", marginTop: "8px" }}>{topic.related.length}</strong>
              </div>
              <div className="surface" style={{ padding: "var(--space-5)", background: "var(--bg-subtle)" }}>
                <span className="caption">출처 수</span>
                <strong style={{ display: "block", marginTop: "8px" }}>{topic.sources.length}</strong>
              </div>
            </div>
          </article>
        </section>

        <aside className="stack" style={{ gap: "var(--space-6)" }}>
          <section className="surface-elevated" style={{ padding: "var(--space-6)" }}>
            <div className="section-head">
              <h2 className="section-title">현재 운영자 컨텍스트</h2>
            </div>
            <div className="stack" style={{ gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
              <strong style={{ fontSize: "1.05rem" }}>{currentUser.displayName}</strong>
              <span className="muted">{currentUser.email}</span>
              <span className="chip chip--accent">{formatEditorialRole(currentUser.role)}</span>
            </div>
          </section>

          <AdminTopicControls
            record={record}
            currentUser={currentUser}
            users={users}
            remotePersistenceEnabled={remotePersistenceEnabled}
          />

          <section className="surface" style={{ padding: "var(--space-6)" }}>
            <div className="section-head">
              <h2 className="section-title">빠른 이동</h2>
            </div>
            <div className="stack" style={{ gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
              <Link href="/admin/topics" className="btn btn-secondary">
                Topic 목록으로
              </Link>
              <Link href={`/admin/topics/${encodeURIComponent(topic.slug)}/edit`} className="btn btn-secondary">
                Topic 편집
              </Link>
              <Link href={`/path/${topic.slug}`} className="btn btn-secondary">
                경로 화면 확인
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
