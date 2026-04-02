import Link from "next/link";

import { AdminReviewActions } from "@/components/admin/admin-review-actions";
import { AdminTopicStatusActions } from "@/components/admin/admin-topic-status-actions";
import type {
  AdminTopicSummaryRecord,
  EditorialUser,
  TopicReviewTask,
  VerificationStatus,
} from "@/lib/domain";
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

function sortByRecent(records: AdminTopicSummaryRecord[]) {
  return [...records].sort((left, right) => {
    const leftTime = new Date(left.topic.lastReviewedAt ?? left.topic.importedAt ?? 0).getTime();
    const rightTime = new Date(right.topic.lastReviewedAt ?? right.topic.importedAt ?? 0).getTime();

    return rightTime - leftTime;
  });
}

function getStatusCount(records: AdminTopicSummaryRecord[], status: VerificationStatus) {
  return records.filter((record) => (record.topic.verificationStatus ?? "generated") === status).length;
}

export function AdminDashboardView({
  currentUser,
  records,
  reviewQueue,
  users,
}: {
  currentUser: EditorialUser;
  records: AdminTopicSummaryRecord[];
  reviewQueue: TopicReviewTask[];
  users: EditorialUser[];
}) {
  const userMap = new Map(users.map((user) => [user.id, user]));
  const assignedToCurrentUser = records.filter((record) => record.assignee?.id === currentUser.id);
  const unassignedCount = records.filter((record) => !record.assignee).length;
  const focusRecords = sortByRecent(
    assignedToCurrentUser.length
      ? assignedToCurrentUser
      : records.filter((record) => (record.topic.verificationStatus ?? "generated") !== "deprecated"),
  ).slice(0, 6);
  const recentlyTouched = sortByRecent(records).slice(0, 6);
  const hasAdminAccess = currentUser.role === "admin";

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div className="stack" style={{ gap: "6px" }}>
          <h1 className="admin-page__title">운영</h1>
          <p className="caption">
            {currentUser.displayName} · {formatEditorialRole(currentUser.role)}
          </p>
        </div>

        <div className="admin-page__actions">
          <Link href="/admin/topics" className="btn btn-secondary">
            Topic
          </Link>
          <Link href="/admin/review-queue" className="btn btn-primary">
            검수 {reviewQueue.length}
          </Link>
          {hasAdminAccess ? (
            <Link href="/admin/users" className="btn btn-secondary">
              운영진
            </Link>
          ) : null}
        </div>
      </header>

      <div className="admin-stats">
        <article className="admin-stat">
          <strong>{records.length}</strong>
          <span>전체</span>
        </article>
        <article className="admin-stat">
          <strong>{getStatusCount(records, "generated")}</strong>
          <span>생성됨</span>
        </article>
        <article className="admin-stat">
          <strong>{getStatusCount(records, "reviewing")}</strong>
          <span>검토중</span>
        </article>
        <article className="admin-stat">
          <strong>{getStatusCount(records, "verified")}</strong>
          <span>검증 완료</span>
        </article>
        <article className="admin-stat">
          <strong>{getStatusCount(records, "published")}</strong>
          <span>게시중</span>
        </article>
        <article className="admin-stat">
          <strong>{unassignedCount}</strong>
          <span>미할당</span>
        </article>
      </div>

      <section className="admin-section">
        <div className="admin-section__head">
          <h2>바로 처리할 Topic</h2>
          <Link href="/admin/topics">전체 보기</Link>
        </div>

        <div className="admin-list">
          {focusRecords.length ? (
            focusRecords.map((record) => {
              const topicStatus = record.topic.verificationStatus ?? "generated";

              return (
                <article key={record.topic.slug} className="admin-record">
                  <div className="admin-record__main">
                    <strong>{record.topic.title}</strong>
                    <span>
                      {record.topic.slug} · {record.topic.category}
                    </span>
                  </div>

                  <div className="admin-record__meta">
                    <span>{formatVerificationStatus(topicStatus)}</span>
                    <span>{record.assignee?.displayName ?? "미할당"}</span>
                    <span>{formatTimestamp(record.topic.lastReviewedAt ?? record.topic.importedAt)}</span>
                  </div>

                  <div className="admin-record__actions">
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
            <div className="admin-empty">지금 바로 처리할 Topic이 없습니다.</div>
          )}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__head">
          <h2>검수 큐</h2>
          <Link href="/admin/review-queue">큐 전체 보기</Link>
        </div>

        <div className="admin-list">
          {reviewQueue.length ? (
            reviewQueue.slice(0, 6).map((task) => {
              const record = records.find((item) => item.topic.slug === task.topicSlug);
              const requester = userMap.get(task.requesterId);
              const reviewer = task.reviewerId ? userMap.get(task.reviewerId) : null;

              return (
                <article key={task.id} className="admin-record">
                  <div className="admin-record__main">
                    <strong>{record?.topic.title ?? task.topicSlug}</strong>
                    <span>
                      {requester?.displayName ?? task.requesterId}
                      {reviewer ? ` · ${reviewer.displayName}` : ""}
                    </span>
                    {task.comment ? <p>{task.comment}</p> : null}
                  </div>

                  <div className="admin-record__meta">
                    <span>{formatReviewTaskStatus(task.status)}</span>
                    <span>{record?.assignee?.displayName ?? "미할당"}</span>
                    <span>{formatTimestamp(task.requestedAt)}</span>
                  </div>

                  <div className="admin-record__actions">
                    <AdminReviewActions
                      topicSlug={task.topicSlug}
                      currentStatus={task.status}
                      currentUserRole={currentUser.role}
                    />
                    <Link href={`/admin/topics/${task.topicSlug}`} className="btn btn-secondary btn-sm">
                      상세
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="admin-empty">열린 검수 요청이 없습니다.</div>
          )}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__head">
          <h2>최근 변경</h2>
          <Link href="/admin/topics">Topic 보기</Link>
        </div>

        <div className="admin-list">
          {recentlyTouched.map((record) => (
            <article key={record.topic.slug} className="admin-record">
              <div className="admin-record__main">
                <strong>{record.topic.title}</strong>
                <span>{record.assignee?.displayName ?? "미할당"}</span>
              </div>

              <div className="admin-record__meta">
                <span>{formatVerificationStatus(record.topic.verificationStatus ?? "generated")}</span>
                <span>r{record.topic.revision ?? 1}</span>
                <span>{formatTimestamp(record.topic.lastReviewedAt ?? record.topic.importedAt)}</span>
              </div>

              <div className="admin-record__actions">
                <Link href={`/admin/topics/${record.topic.slug}`} className="btn btn-secondary btn-sm">
                  상세
                </Link>
                <Link href={`/admin/topics/${record.topic.slug}/edit`} className="btn btn-secondary btn-sm">
                  편집
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
