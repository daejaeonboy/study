import Link from "next/link";

import type { EditorialUser } from "@/lib/domain";
import { formatEditorialRole } from "@/lib/utils";

export function AdminUsersView({
  currentUser,
  users,
}: {
  currentUser: EditorialUser;
  users: EditorialUser[];
}) {
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

  const counts = users.reduce(
    (result, user) => {
      result[user.role] += 1;
      return result;
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
            MEMBER MANAGEMENT
          </span>
          <h1 className="hero-title">회원 관리</h1>
          <p className="hero-copy" style={{ maxWidth: "900px" }}>
            운영 계정 수, 역할 분포, 현재 등록된 운영진 목록을 한 화면에서 확인하는
            화면입니다.
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
            <Link href="/admin" className="btn btn-secondary">
              대시보드
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
            <strong>{counts.admin}</strong>
            <span>관리자</span>
          </div>
          <div className="metric">
            <strong>{counts.editor}</strong>
            <span>편집</span>
          </div>
          <div className="metric">
            <strong>{counts.reviewer}</strong>
            <span>검수</span>
          </div>
        </div>
      </header>

      <section className="stack" style={{ gap: "var(--space-6)", marginTop: "var(--space-8)" }}>
        <div className="section-head">
          <h2 className="section-title">운영진 목록</h2>
          <p className="muted">현재 로그인 계정은 맨 위에 강조해서 표시합니다.</p>
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
                  {user.id === currentUser.id ? (
                    <span className="chip chip--accent">현재 로그인</span>
                  ) : null}
                  <span className="chip">{formatEditorialRole(user.role)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
