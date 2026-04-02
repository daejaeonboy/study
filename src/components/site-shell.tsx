"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

import { HeaderNav } from "@/components/header-nav";
import {
  findBranchByDiscipline,
  findDisciplineStage,
  findStageByTopic,
  getDisciplineProfile,
} from "@/lib/disciplines";

type SectionMeta = {
  title: string;
  hint: string;
  fileName: string;
  outline: string[];
  links: string[];
};

const HOME_LEFT_DEFAULT_WIDTH = 320;
const HOME_LEFT_MIN_WIDTH = 260;
const HOME_LEFT_MAX_WIDTH = 460;
const HOME_RIGHT_DEFAULT_WIDTH = 430;
const HOME_RIGHT_MIN_WIDTH = 340;
const HOME_RIGHT_MAX_WIDTH = 620;
const HOME_SIDEBAR_EDGE = 0;

const sections: Array<{ test: (pathname: string) => boolean; meta: SectionMeta }> = [
  {
    test: (pathname) => pathname === "/",
    meta: {
      title: "홈",
      hint: "오늘 다시 열어야 할 시작 노트와 연결된 기록을 확인합니다.",
      fileName: "start-note.md",
      outline: ["오늘의 시작 노트", "최근 열람 기록", "연결된 노트", "탐색 태그"],
      links: ["주제 탐구로 이동", "저장한 기록 확인", "작업실에서 기록 이어쓰기"],
    },
  },
  {
    test: (pathname) => pathname.startsWith("/topic"),
    meta: {
      title: "주제",
      hint: "한 문서를 길게 읽고, 핵심 개념과 다음 탐구로 이어지는 읽기 뷰입니다.",
      fileName: "topic-note.md",
      outline: ["요약", "핵심 본문", "주요 개념", "자가 검토", "다음 탐구"],
      links: ["여정 보기", "기록에 보관", "연관 주제로 확장"],
    },
  },
  {
    test: (pathname) => pathname.startsWith("/path"),
    meta: {
      title: "여정",
      hint: "현재 위치와 다음 단계가 이어지는 학습 경로를 정리합니다.",
      fileName: "path-map.md",
      outline: ["시작점", "현재 위치", "탐구의 궤적", "추천 전환"],
      links: ["핵심 주제로 되돌아가기", "다음 단계 열기", "관련 주제 저장"],
    },
  },
  {
    test: (pathname) => pathname.startsWith("/guide"),
    meta: {
      title: "가이드",
      hint: "질문에서 출발해 어떤 경로로 탐구를 시작할지 정리합니다.",
      fileName: "guide-note.md",
      outline: ["입력 신호", "제안된 경로", "학습 경로", "브리지 주제"],
      links: ["추천 경로 시작", "주제부터 보기", "여정으로 연결"],
    },
  },
  {
    test: (pathname) => pathname.startsWith("/admin"),
    meta: {
      title: "어드민",
      hint: "여러 운영진이 Topic을 할당하고 검수 상태를 관리하는 운영 콘솔입니다.",
      fileName: "admin-console.md",
      outline: ["운영 현황", "Topic 목록", "담당자", "검수 큐", "운영 상세", "Topic 편집"],
      links: ["Topic 운영 목록", "검수 큐 이동", "운영 상세에서 바로 편집"],
    },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resolveSection(pathname: string): SectionMeta {
  return sections.find((section) => section.test(pathname))?.meta ?? sections[0].meta;
}

function CanvasContextSidebar() {
  const searchParams = useSearchParams();
  const selectedDiscipline = searchParams.get("discipline") ?? "천문학";
  const selectedStage = searchParams.get("stage");
  const selectedTopic = searchParams.get("topic");
  const selectedBranch = findBranchByDiscipline(selectedDiscipline);
  const profile = getDisciplineProfile(selectedDiscipline);
  const topicStage = findStageByTopic(selectedDiscipline, selectedTopic);
  const activeStage =
    selectedDiscipline === "수학"
      ? topicStage ?? findDisciplineStage(selectedDiscipline, selectedStage)
      : null;
  const selectedTopicDescription = selectedTopic
    ? profile.topicDescriptions?.[selectedTopic] ?? null
    : null;

  return (
    <article className="context-prose">
      <p className="context-prose__eyebrow">
        {[selectedBranch?.label, selectedDiscipline, activeStage?.level, selectedTopic]
          .filter(Boolean)
          .join(" / ")}
      </p>

      <h2 className="context-prose__title">
        {selectedTopic ?? activeStage?.title ?? selectedDiscipline}
      </h2>

      <p className="context-prose__lead">
        {selectedTopicDescription ?? activeStage?.summary ?? profile.summary}
      </p>

      <section className="context-prose__section">
        <h3>이 학문은</h3>
        <p>{profile.summary}</p>
      </section>

      {activeStage ? (
        <section className="context-prose__section">
          <h3>
            {activeStage.level} · {activeStage.title}
          </h3>
          <p>{activeStage.summary}</p>
          <p>
            이 단계에서는{" "}
            {activeStage.topics.map((topic, index) => (
              <span key={topic}>
                {index > 0 ? ", " : ""}
                <Link
                  href={`/?discipline=${encodeURIComponent(selectedDiscipline)}&stage=${encodeURIComponent(activeStage.level)}&topic=${encodeURIComponent(topic)}`}
                  className={`context-prose__inline-link ${selectedTopic === topic ? "is-active" : ""}`}
                >
                  {topic}
                </Link>
              </span>
            ))}
            를 먼저 다룹니다.
          </p>
        </section>
      ) : null}

      {selectedTopic && selectedTopicDescription ? (
        <section className="context-prose__section">
          <h3>{selectedTopic}</h3>
          <p>{selectedTopicDescription}</p>
        </section>
      ) : null}

      <section className="context-prose__section">
        <h3>핵심 질문</h3>
        {profile.questions.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </section>

      <section className="context-prose__section">
        <h3>주요 접근</h3>
        <p>{profile.approaches.join(", ")}.</p>
      </section>

      {profile.stages?.length ? (
        <section className="context-prose__section">
          <h3>단계별 흐름</h3>
          {profile.stages.map((stage) => (
            <p
              key={stage.level}
              className={`context-prose__line ${activeStage?.level === stage.level ? "is-active" : ""}`}
            >
              <Link
                href={`/?discipline=${encodeURIComponent(selectedDiscipline)}&stage=${encodeURIComponent(stage.level)}`}
                className="context-prose__inline-link"
              >
                {stage.level}
              </Link>
              {` 는 ${stage.title} 단계로, ${stage.summary}`}
            </p>
          ))}
        </section>
      ) : null}

      <section className="context-prose__section">
        <h3>같이 볼 학문</h3>
        <p>
          {(selectedBranch?.disciplines ?? []).map((item, index) => (
            <span key={item}>
              {index > 0 ? ", " : ""}
              <Link
                href={`/?discipline=${encodeURIComponent(item)}`}
                className={`context-prose__inline-link ${item === selectedDiscipline ? "is-active" : ""}`}
              >
                {item}
              </Link>
            </span>
          ))}
        </p>
      </section>
    </article>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentSection = resolveSection(pathname);
  const isCanvasHome = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");
  const isStandaloneAuthPage =
    pathname.startsWith("/auth") || pathname.startsWith("/login") || pathname.startsWith("/signup");
  const hideContextSidebar = isAdminPage;
  const [homeSidebarWidths, setHomeSidebarWidths] = useState({
    left: HOME_LEFT_DEFAULT_WIDTH,
    right: HOME_RIGHT_DEFAULT_WIDTH,
  });
  const [resizingSide, setResizingSide] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    if (!isCanvasHome || !resizingSide) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const maxWidth = Math.min(Math.floor(window.innerWidth * 0.42), HOME_RIGHT_MAX_WIDTH);

      setHomeSidebarWidths((current) => {
        if (resizingSide === "left") {
          return {
            ...current,
            left: clamp(event.clientX - HOME_SIDEBAR_EDGE, HOME_LEFT_MIN_WIDTH, Math.min(HOME_LEFT_MAX_WIDTH, maxWidth)),
          };
        }

        return {
          ...current,
          right: clamp(
            window.innerWidth - event.clientX - HOME_SIDEBAR_EDGE,
            HOME_RIGHT_MIN_WIDTH,
            maxWidth,
          ),
        };
      });
    }

    function stopResizing() {
      setResizingSide(null);
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    }

    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [isCanvasHome, resizingSide]);

  function handleResizeStart(side: "left" | "right") {
    return (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setResizingSide(side);
    };
  }

  const homeLeftSidebarStyle = isCanvasHome
    ? { width: `${homeSidebarWidths.left}px` }
    : undefined;
  const homeRightSidebarStyle = isCanvasHome
    ? { width: `${homeSidebarWidths.right}px` }
    : undefined;

  if (isCanvasHome || isStandaloneAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div
      className={`page-shell ${isCanvasHome ? "page-shell--canvas" : ""} ${
        hideContextSidebar ? "page-shell--single-pane" : ""
      }`}
    >
      <aside className={`vault-sidebar ${isAdminPage ? "vault-sidebar--admin" : ""}`} style={homeLeftSidebarStyle}>
        {isCanvasHome ? (
          <div
            className="sidebar-resizer sidebar-resizer--right"
            role="separator"
            aria-orientation="vertical"
            aria-label="왼쪽 사이드바 너비 조절"
            onPointerDown={handleResizeStart("left")}
          />
        ) : null}

        <div className="vault-header">
          <Link href="/" className="vault-brand">
            <span className="vault-brand__mark">IK</span>
            <span className="vault-brand__text">
              <strong>{isAdminPage ? "운영 콘솔" : "지식 공간"}</strong>
              <small>{isAdminPage ? "admin workspace" : "linked learning workspace"}</small>
            </span>
          </Link>
        </div>

        <Suspense fallback={<div className="explorer-shell" />}>
          <HeaderNav />
        </Suspense>
      </aside>

      <main className="main-canvas">
        {isCanvasHome ? null : (
          <header className="canvas-header">
            <div className="canvas-breadcrumb" aria-label="문서 경로">
              <span>{isAdminPage ? "admin" : "vault"}</span>
              <span>/</span>
              <span>{currentSection.title}</span>
            </div>
            <span className="canvas-tab">{isAdminPage ? "console" : currentSection.fileName}</span>
          </header>
        )}
        <div className="canvas-content">{children}</div>
      </main>

      {hideContextSidebar ? null : (
        <aside
          className={`context-sidebar ${isCanvasHome ? "context-sidebar--prose" : ""}`}
          style={homeRightSidebarStyle}
        >
          {isCanvasHome ? (
            <>
              <div
                className="sidebar-resizer sidebar-resizer--left"
                role="separator"
                aria-orientation="vertical"
                aria-label="오른쪽 사이드바 너비 조절"
                onPointerDown={handleResizeStart("right")}
              />
              <Suspense fallback={<article className="context-prose" />}>
                <CanvasContextSidebar />
              </Suspense>
            </>
          ) : (
            <>
              <section className="context-panel">
                <h2 className="outline-title">문서 구조</h2>
                <div className="context-list">
                  {currentSection.outline.map((item) => (
                    <div key={item} className="context-list__item">
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="context-panel">
                <h2 className="outline-title">연결 문서</h2>
                <div className="context-list">
                  {currentSection.links.map((item) => (
                    <div key={item} className="context-list__item">
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
