import Link from "next/link";

import type { AdminTopicRecord, EditorialUser, TopicReviewTask } from "@/lib/domain";
import { formatEditorialRole, formatReviewTaskStatus, formatVerificationStatus } from "@/lib/utils";

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

export function AdminDashboardView({
  currentUser,
  records,
  reviewQueue,
  users,
}: {
  currentUser: EditorialUser;
  records: AdminTopicRecord[];
  reviewQueue: TopicReviewTask[];
  users: EditorialUser[];
}) {
  const assignedToCurrentUser = records.filter((record) => record.assignee?.id === currentUser.id);
  const publishedTopics = records.filter(
    (record) => (record.topic.verificationStatus ?? "generated") === "published",
  );
  const reviewingTopics = records.filter(
    (record) => (record.topic.verificationStatus ?? "generated") === "reviewing",
  );
  const recentlyTouched = [...records]
    .sort((left, right) => {
      const leftTime = new Date(left.topic.lastReviewedAt ?? left.topic.importedAt ?? 0).getTime();
      const rightTime = new Date(
        right.topic.lastReviewedAt ?? right.topic.importedAt ?? 0,
      ).getTime();

      return rightTime - leftTime;
    })
    .slice(0, 5);
  const recentReviewTasks = reviewQueue.slice(0, 5);
  const rolePriority = { admin: 0, editor: 1, reviewer: 2 } as const;
  const sortedUsers = [...users].sort((left, right) => {
    if (left.id === currentUser.id) {
      return -1;
    }

    if (right.id === currentUser.id) {
      return 1;
    }

    const roleDifference = rolePriority[left.role] - rolePriority[right.role];

    if (roleDifference !== 0) {
      return roleDifference;
    }

    return left.displayName.localeCompare(right.displayName, "ko-KR");
  });
  const userCounts = users.reduce(
    (counts, user) => {
      counts[user.role] += 1;
      return counts;
    },
    {
      admin: 0,
      editor: 0,
      reviewer: 0,
    },
  );

  return (
    <section className="view">
      <header className="stack" style={{ gap: "var(--space-6)" }}>
        <div className="stack" style={{ gap: "var(--space-4)" }}>
          <span className="caption" style={{ color: "var(--accent)" }}>
            ADMIN CONSOLE
          </span>
          <h1 className="hero-title">운영 대시보드</h1>
          <p className="hero-copy" style={{ maxWidth: "900px" }}>
            Topic 편집, 검수, 할당 현황을 한 화면에서 보는 운영 홈입니다. 이제 실제
            Supabase Auth 로그인 계정 기준으로 운영자 권한을 판정합니다.
          </p>
        </div>

        <div
          className="surface-elevated"
          style={{
            padding: "var(--space-6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "var(--space-6)",
            flexWrap: "wrap",
          }}
        >
          <div className="stack" style={{ gap: "var(--space-2)" }}>
            <span className="caption">현재 운영자</span>
            <strong style={{ fontSize: "1.4rem", color: "var(--text-strong)" }}>
              {currentUser.displayName}
            </strong>
            <span className="muted">{currentUser.email}</span>
          </div>

          <div className="chip-row">
            <span className="chip chip--accent">{formatEditorialRole(currentUser.role)}</span>
            <Link href="/admin/topics" className="btn btn-secondary">
              Topic 운영 보기
            </Link>
            <Link href="/admin/users" className="btn btn-secondary">
              회원 관리
            </Link>
            <Link href="/admin/review-queue" className="btn btn-primary">
              검수 큐 열기
            </Link>
            <Link href="/login" className="btn btn-secondary">
              계정
            </Link>
          </div>
        </div>

        <div className="metrics">
          <div className="metric">
            <strong>{records.length}</strong>
            <span>전체 Topic</span>
          </div>
          <div className="metric">
            <strong>{assignedToCurrentUser.length}</strong>
            <span>내 할당 Topic</span>
          </div>
          <div className="metric">
            <strong>{reviewQueue.length}</strong>
            <span>열린 검수 작업</span>
          </div>
          <div className="metric">
            <strong>{reviewingTopics.length}</strong>
            <span>검토중 Topic</span>
          </div>
          <div className="metric">
            <strong>{publishedTopics.length}</strong>
            <span>게시중 Topic</span>
          </div>
        </div>
      </header>

      <div className="stack" style={{ gap: "var(--space-8)", marginTop: "var(--space-8)" }}>
        <section className="stack" style={{ gap: "var(--space-6)" }}>
          <div className="section-head">
            <h2 className="section-title">최근 손본 Topic</h2>
            <p className="muted">최근 검토/반영 기준으로 정렬한 운영 우선순위입니다.</p>
          </div>

          <div className="stack" style={{ gap: "var(--space-3)" }}>
            {recentlyTouched.map((record) => (
              <article
                key={record.topic.slug}
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
                  <div className="stack" style={{ gap: "var(--space-2)" }}>
                    <div className="chip-row">
                      <span className="chip chip--alt">{record.topic.category}</span>
                      <span className="chip">
                        {formatVerificationStatus(record.topic.verificationStatus ?? "generated")}
                      </span>
                    </div>
                    <strong style={{ fontSize: "1.1rem", color: "var(--text-strong)" }}>
                      {record.topic.title}
                    </strong>
                    <p className="muted">{record.topic.summary}</p>
                  </div>

                  <div className="stack" style={{ gap: "var(--space-2)", minWidth: "220px" }}>
                    <span className="caption">
                      담당 {record.assignee?.displayName ?? "미할당"}
                    </span>
                    <span className="caption">
                      최근 반영 {formatTimestamp(record.topic.lastReviewedAt ?? record.topic.importedAt)}
                    </span>
                    <div className="hero-actions">
                      <Link href={`/admin/topics/${record.topic.slug}`} className="btn btn-secondary">
                        운영 상세
                      </Link>
                      <Link
                        href={`/admin/topics/${encodeURIComponent(record.topic.slug)}/edit`}
                        className="btn btn-primary"
                      >
                        Topic 편집
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="stack" style={{ gap: "var(--space-6)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "var(--space-4)",
              flexWrap: "wrap",
            }}
          >
            <div className="section-head">
              <h2 className="section-title">열린 검수 작업</h2>
              <p className="muted">오른쪽 요약 대신 본문에서 바로 확인할 수 있게 정리했습니다.</p>
            </div>
            <Link href="/admin/review-queue" className="btn btn-secondary">
              검수 큐 전체 보기
            </Link>
          </div>

          <div className="stack" style={{ gap: "var(--space-3)" }}>
            {recentReviewTasks.length > 0 ? (
              recentReviewTasks.map((task) => (
                <div
                  key={task.id}
                  className="surface"
                  style={{
                    padding: "var(--space-5)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ color: "var(--text-strong)" }}>{task.topicSlug}</strong>
                    <span className="chip">{formatReviewTaskStatus(task.status)}</span>
                  </div>
                  <p className="muted" style={{ marginTop: "10px", fontSize: "0.92rem" }}>
                    {task.comment ?? "추가 코멘트 없음"}
                  </p>
                </div>
              ))
            ) : (
              <div className="surface" style={{ padding: "var(--space-6)", border: "1px solid var(--line)" }}>
                <p className="muted">현재 열린 검수 작업이 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        <section className="stack" style={{ gap: "var(--space-6)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "var(--space-4)",
              flexWrap: "wrap",
            }}
          >
            <div className="section-head">
              <h2 className="section-title">운영진 관리</h2>
              <p className="muted">현재 등록된 운영 계정을 역할별로 확인할 수 있습니다.</p>
            </div>
            <div className="hero-actions">
              <Link href="/admin/users" className="btn btn-secondary">
                회원 관리 화면
              </Link>
              {currentUser.role === "admin" ? (
                <Link href="/login/signup" className="btn btn-primary">
                  운영진 계정 등록
                </Link>
              ) : null}
            </div>
          </div>

          <div className="metrics">
            <div className="metric">
              <strong>{users.length}</strong>
              <span>전체 운영진</span>
            </div>
            <div className="metric">
              <strong>{userCounts.admin}</strong>
              <span>관리자</span>
            </div>
            <div className="metric">
              <strong>{userCounts.editor}</strong>
              <span>편집</span>
            </div>
            <div className="metric">
              <strong>{userCounts.reviewer}</strong>
              <span>검수</span>
            </div>
          </div>

          <div className="stack" style={{ gap: "var(--space-3)" }}>
            {sortedUsers.map((user) => (
              <article
                key={user.id}
                className={user.id === currentUser.id ? "surface-elevated" : "surface"}
                style={{
                  padding: "var(--space-5)",
                  border: "1px solid var(--line)",
                }}
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
                  <div className="stack" style={{ gap: "var(--space-2)" }}>
                    <strong style={{ fontSize: "1.05rem", color: "var(--text-strong)" }}>
                      {user.displayName}
                    </strong>
                    <span className="muted">{user.email}</span>
                  </div>
                  <div className="chip-row">
                    {user.id === currentUser.id ? <span className="chip chip--accent">현재 로그인</span> : null}
                    <span className="chip">{formatEditorialRole(user.role)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface" style={{ padding: "var(--space-6)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "var(--space-4)",
              flexWrap: "wrap",
            }}
          >
            <div className="section-head">
              <h2 className="section-title">빠른 이동</h2>
              <p className="muted">자주 쓰는 운영 화면은 본문 아래에만 남겼습니다.</p>
            </div>
            <div className="hero-actions">
              <Link href="/admin/topics" className="btn btn-secondary">
                전체 Topic 목록
              </Link>
              <Link href="/admin/users" className="btn btn-secondary">
                회원 관리
              </Link>
              <Link href="/admin/topics" className="btn btn-secondary">
                Topic 편집 진입
              </Link>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
