import Link from "next/link";

import { AdminReviewActions } from "@/components/admin/admin-review-actions";
import type { AdminTopicSummaryRecord, EditorialUser, TopicReviewTask } from "@/lib/domain";
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
  currentUser,
  tasks,
  records,
  users,
}: {
  currentUser: EditorialUser;
  tasks: TopicReviewTask[];
  records: AdminTopicSummaryRecord[];
  users: EditorialUser[];
}) {
  const recordMap = new Map(records.map((record) => [record.topic.slug, record]));
  const userMap = new Map(users.map((user) => [user.id, user]));

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div className="stack" style={{ gap: "6px" }}>
          <h1 className="admin-page__title">검수</h1>
          <p className="caption">{tasks.length}개 대기 중</p>
        </div>
      </header>

      <section className="admin-section">
        <div className="admin-table admin-table--review">
          <div className="admin-table__head">
            <span>Topic</span>
            <span>요청</span>
            <span>상태</span>
            <span>시간</span>
            <span>액션</span>
          </div>

          {tasks.length ? (
            tasks.map((task) => {
              const record = recordMap.get(task.topicSlug);
              const requester = userMap.get(task.requesterId);
              const reviewer = task.reviewerId ? userMap.get(task.reviewerId) : undefined;

              return (
                <article key={task.id} className="admin-table__row">
                  <div className="admin-table__topic">
                    <strong>{record?.topic.title ?? task.topicSlug}</strong>
                    <span>{record?.topic.slug ?? task.topicSlug}</span>
                    {task.comment ? <p>{task.comment}</p> : null}
                  </div>

                  <div className="admin-table__cell">
                    <strong>{requester?.displayName ?? task.requesterId}</strong>
                    <span>{reviewer?.displayName ?? "검수자 미지정"}</span>
                  </div>

                  <div className="admin-table__cell">
                    <strong>{formatReviewTaskStatus(task.status)}</strong>
                    <span>{record?.assignee?.displayName ?? "미할당"}</span>
                  </div>

                  <div className="admin-table__cell">
                    <strong>{formatTimestamp(task.requestedAt)}</strong>
                    <span>{task.reviewedAt ? formatTimestamp(task.reviewedAt) : "검토 전"}</span>
                  </div>

                  <div className="admin-table__actions">
                    <AdminReviewActions
                      topicSlug={task.topicSlug}
                      currentStatus={task.status}
                      currentUserRole={currentUser.role}
                    />
                    <Link href={`/admin/topics/${task.topicSlug}`} className="btn btn-secondary btn-sm">
                      상세
                    </Link>
                    <Link href={`/admin/topics/${task.topicSlug}/edit`} className="btn btn-primary btn-sm">
                      편집
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="admin-empty">열린 검수 작업이 없습니다.</div>
          )}
        </div>
      </section>
    </section>
  );
}
