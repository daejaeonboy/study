"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { useAppUser } from "@/components/providers/app-user-provider";
import { disciplineBranches, getDisciplineProfile } from "@/lib/disciplines";

type UtilityItem = {
  href: string;
  label: string;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appUser = useAppUser();
  const selectedDiscipline = pathname === "/" ? searchParams.get("discipline") : null;
  const selectedStage = pathname === "/" ? searchParams.get("stage") : null;
  const selectedTopic = pathname === "/" ? searchParams.get("topic") : null;
  const selectedProfile = selectedDiscipline ? getDisciplineProfile(selectedDiscipline) : null;
  const activeStage =
    selectedDiscipline && selectedProfile?.stages?.length
      ? (selectedStage ?? selectedProfile.stages[0]?.level ?? null)
      : null;
  const isAdminPage = pathname.startsWith("/admin");
  const utilityItems: UtilityItem[] = isAdminPage
    ? [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/topics", label: "Topics" },
        { href: "/admin/review-queue", label: "Review" },
        { href: "/admin/users", label: "Users" },
        { href: "/", label: "Exit Admin" },
      ]
    : [
        { href: "/", label: "Canvas" },
        { href: "/guide", label: "Guide" },
        { href: "/admin", label: "Admin" },
        { href: appUser ? "/" : "/auth", label: appUser ? "Home" : "Sign In" },
      ];

  return (
    <nav className="explorer-shell" aria-label={isAdminPage ? "Admin Navigation" : "Discipline Explorer"}>
      <div className="explorer-topbar" style={isAdminPage ? { display: "flex", flexDirection: "column", gap: "2px" } : undefined}>
        {utilityItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`explorer-tool ${active ? "active" : ""} ${isAdminPage ? "explorer-tool--admin" : ""}`}
              aria-current={active ? "page" : undefined}
              style={isAdminPage ? { justifyContent: "flex-start", paddingLeft: "var(--space-4)", width: "100%" } : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {!isAdminPage && (
        <>
          <section className="explorer-account" style={{ padding: "var(--space-4)", gap: "var(--space-3)" }}>
            <strong className="explorer-account__name">
              {appUser ? appUser.displayName : "사용자 인증"}
            </strong>
            <div className="explorer-account__actions">
              {appUser ? (
                <Link href="/" className="explorer-account__primary">
                  탐색 계속
                </Link>
              ) : (
                <>
                  <Link href="/auth?next=/" className="explorer-account__primary">
                    로그인
                  </Link>
                  <Link href="/signup?next=/" className="explorer-account__secondary">
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </section>

          <div className="explorer-section">
            <div className="explorer-tree" style={{ marginTop: "var(--space-4)" }}>
              {disciplineBranches.map((branch) => (
                <details key={branch.id} className="explorer-branch" open>
                  <summary className="explorer-branch__summary">{branch.label}</summary>
                  <div className="explorer-branch__children">
                    {branch.disciplines.map((discipline) => {
                      const disciplineProfile = getDisciplineProfile(discipline);
                      const hasStages = Boolean(disciplineProfile.stages?.length);

                      if (!hasStages) {
                        return (
                          <Link
                            key={discipline}
                            href={`/?discipline=${encodeURIComponent(discipline)}`}
                            className={`explorer-leaf ${selectedDiscipline === discipline ? "active" : ""}`}
                          >
                            {discipline}
                          </Link>
                        );
                      }

                      return (
                        <div key={discipline} className="explorer-node-group">
                          <Link
                            href={`/?discipline=${encodeURIComponent(discipline)}`}
                            className={`explorer-leaf ${selectedDiscipline === discipline ? "active" : ""}`}
                          >
                            {discipline}
                          </Link>

                          {selectedDiscipline === discipline ? (
                            <div className="explorer-subtree">
                              {(disciplineProfile.stages ?? []).map((stage) => (
                                <div key={stage.level} className="explorer-stage">
                                  <Link
                                    href={`/?discipline=${encodeURIComponent(discipline)}&stage=${encodeURIComponent(stage.level)}`}
                                    className={`explorer-stage__link ${activeStage === stage.level ? "active" : ""}`}
                                  >
                                    {stage.level}
                                  </Link>

                                  {activeStage === stage.level ? (
                                    <div className="explorer-topic-list">
                                      {stage.topics.length ? (
                                        stage.topics.map((topic) => (
                                          <Link
                                            key={topic}
                                            href={`/?discipline=${encodeURIComponent(discipline)}&stage=${encodeURIComponent(stage.level)}&topic=${encodeURIComponent(topic)}`}
                                            className={`explorer-leaf explorer-leaf--topic ${selectedTopic === topic ? "active" : ""}`}
                                          >
                                            {topic}
                                          </Link>
                                        ))
                                      ) : (
                                        <span className="explorer-note">세부 주제 설계 예정</span>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
