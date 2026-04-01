import Link from "next/link";

import type { AdminTopicRecord, EditorialUser, TopicReviewTask } from "@/lib/domain";
import { formatReviewTaskStatus } from "@/lib/utils";

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

export function AdminReviewQueueView({
  tasks,
  records,
  users,
}: {
  tasks: TopicReviewTask[];
  records: AdminTopicRecord[];
  users: EditorialUser[];
}) {
  const recordMap = new Map(records.map((record) => [record.topic.slug, record]));
  const userMap = new Map(users.map((user) => [user.id, user]));

  return (
    <section className="view">
      <header className="stack" style={{ gap: "var(--space-6)" }}>
        <div className="stack" style={{ gap: "var(--space-4)" }}>
          <span className="caption" style={{ color: "var(--accent)" }}>
            REVIEW QUEUE
          </span>
          <h1 className="hero-title">검수 큐</h1>
          <p className="hero-copy" style={{ maxWidth: "880px" }}>
            승인 전 상태의 검수 요청을 모아 보는 화면입니다. 어떤 Topic이 누구에게 요청되었고,
            어떤 코멘트가 달려 있는지 한 번에 확인할 수 있습니다.
          </p>
        </div>
      </header>

      <div className="stack" style={{ gap: "var(--space-4)", marginTop: "var(--space-8)" }}>
        {tasks.map((task) => {
          const record = recordMap.get(task.topicSlug);
          const requester = userMap.get(task.requesterId);
          const reviewer = task.reviewerId ? userMap.get(task.reviewerId) : undefined;

          return (
            <article
              key={task.id}
              className="surface card-interactive"
              style={{ padding: "var(--space-6)" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                }}
              >
                <div className="stack" style={{ gap: "var(--space-2)", maxWidth: "720px" }}>
                  <div className="chip-row">
                    <span className="chip chip--alt">{record?.topic.category ?? "미분류"}</span>
                    <span className="chip">{formatReviewTaskStatus(task.status)}</span>
                  </div>
                  <strong style={{ fontSize: "1.1rem", color: "var(--text-strong)" }}>
                    {record?.topic.title ?? task.topicSlug}
                  </strong>
                  <p className="muted">{task.comment ?? "추가 코멘트 없음"}</p>
                </div>

                <div className="stack" style={{ gap: "var(--space-2)", minWidth: "260px" }}>
                  <span className="caption">
                    요청자 {requester?.displayName ?? task.requesterId}
                  </span>
                  <span className="caption">
                    검수자 {reviewer?.displayName ?? "미지정"}
                  </span>
                  <span className="caption">요청 시각 {formatTimestamp(task.requestedAt)}</span>
                  <span className="caption">처리 시각 {formatTimestamp(task.reviewedAt)}</span>
                  <div className="hero-actions">
                    <Link href={`/admin/topics/${task.topicSlug}`} className="btn btn-secondary">
                      운영 상세
                    </Link>
                    <Link
                      href={`/admin/topics/${encodeURIComponent(task.topicSlug)}/edit`}
                      className="btn btn-primary"
                    >
                      Topic 편집
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {!tasks.length ? (
          <div className="surface" style={{ padding: "var(--space-10)", textAlign: "center" }}>
            <p className="muted">열린 검수 작업이 없습니다.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
