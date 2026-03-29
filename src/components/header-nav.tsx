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
  const utilityItems: UtilityItem[] = [
    { href: "/", label: "Canvas" },
    { href: "/guide", label: "Guide" },
    { href: "/library", label: "Library" },
    { href: "/admin", label: "Admin" },
    { href: "/auth", label: appUser ? "Account" : "Sign In" },
  ];

  return (
    <nav className="explorer-shell" aria-label="Discipline Explorer">
      <div className="explorer-topbar">
        {utilityItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`explorer-tool ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <section className="explorer-account">
        <span className="explorer-account__eyebrow">
          {appUser ? "학습 계정" : "메인 사용자 인증"}
        </span>
        <strong className="explorer-account__name">
          {appUser ? `${appUser.displayName}님 환영합니다` : "로그인해서 개인 서고를 시작하세요"}
        </strong>
        <p className="explorer-account__copy">
          {appUser
            ? "메인 학습 기록과 서고 흐름을 이 계정 기준으로 이어서 사용할 수 있습니다."
            : "어드민 로그인과 별개로, 일반 사용자는 여기서 로그인해 메인 서비스를 사용합니다."}
        </p>
        <div className="explorer-account__actions">
          <Link
            href={appUser ? "/library" : "/auth?next=/library"}
            className="explorer-account__primary"
          >
            {appUser ? "내 서고 열기" : "로그인"}
          </Link>
          <Link
            href={appUser ? "/auth" : "/signup?next=/library"}
            className="explorer-account__secondary"
          >
            {appUser ? "계정 관리" : "회원가입"}
          </Link>
        </div>
      </section>

      <div className="explorer-section">
        <div className="explorer-section__meta">
          <span className="explorer-section__eyebrow">탐색기</span>
          <strong className="explorer-section__workspace">STUDY</strong>
        </div>

        <div className="explorer-root">학문</div>

        <div className="explorer-tree">
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
    </nav>
  );
}
