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
    <section className="admin-page">
      <header className="admin-page__header">
        <div className="stack" style={{ gap: "6px" }}>
          <h1 className="admin-page__title">운영진</h1>
          <p className="caption">
            {currentUser.displayName} · {formatEditorialRole(currentUser.role)}
          </p>
        </div>

        <div className="admin-page__actions">
          <Link href="/admin" className="btn btn-secondary">
            개요
          </Link>
          {currentUser.role === "admin" ? (
            <Link href="/login/signup" className="btn btn-primary">
              등록
            </Link>
          ) : null}
        </div>
      </header>

      <div className="admin-stats">
        <article className="admin-stat">
          <strong>{users.length}</strong>
          <span>전체</span>
        </article>
        <article className="admin-stat">
          <strong>{counts.admin}</strong>
          <span>관리자</span>
        </article>
        <article className="admin-stat">
          <strong>{counts.editor}</strong>
          <span>편집</span>
        </article>
        <article className="admin-stat">
          <strong>{counts.reviewer}</strong>
          <span>검수</span>
        </article>
      </div>

      <section className="admin-section">
        <div className="admin-list">
          {sortedUsers.map((user) => (
            <article key={user.id} className="admin-record">
              <div className="admin-record__main">
                <strong>{user.displayName}</strong>
                <span>{user.email}</span>
              </div>

              <div className="admin-record__meta">
                <span>{formatEditorialRole(user.role)}</span>
                <span>{user.id === currentUser.id ? "현재 로그인" : ""}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
