"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { disciplineBranches, getDisciplineProfile } from "@/lib/disciplines";

type UtilityItem = {
  href: string;
  label: string;
};

const utilityItems: UtilityItem[] = [
  { href: "/", label: "Canvas" },
  { href: "/guide", label: "Guide" },
  { href: "/library", label: "Library" },
  { href: "/workspace", label: "Workspace" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedDiscipline = pathname === "/" ? searchParams.get("discipline") : null;
  const selectedStage = pathname === "/" ? searchParams.get("stage") : null;
  const selectedTopic = pathname === "/" ? searchParams.get("topic") : null;
  const mathProfile = getDisciplineProfile("수학");
  const activeMathStage = selectedDiscipline === "수학" ? (selectedStage ?? mathProfile.stages?.[0]?.level ?? null) : null;

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
                  if (discipline !== "수학") {
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

                      {selectedDiscipline === "수학" ? (
                        <div className="explorer-subtree">
                          {(mathProfile.stages ?? []).map((stage) => (
                            <div key={stage.level} className="explorer-stage">
                              <Link
                                href={`/?discipline=${encodeURIComponent(discipline)}&stage=${encodeURIComponent(stage.level)}`}
                                className={`explorer-stage__link ${activeMathStage === stage.level ? "active" : ""}`}
                              >
                                {stage.level}
                              </Link>

                              {activeMathStage === stage.level ? (
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
