"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { HeaderNav } from "@/components/header-nav";

type SectionMeta = {
  title: string;
  hint: string;
  fileName: string;
  outline: string[];
  links: string[];
};

const sections: Array<{ test: (pathname: string) => boolean; meta: SectionMeta }> = [
  {
    test: (pathname) => pathname === "/",
    meta: {
      title: "홈",
      hint: "오늘 다시 열어야 할 시작 노트와 연결된 기록을 확인합니다.",
      fileName: "start-note.md",
      outline: ["오늘의 시작 노트", "최근 열람 기록", "연결된 노트", "탐색 태그"],
      links: ["주제 탐구로 이동", "서고에서 저장 노트 확인", "작업실에서 기록 이어쓰기"],
    },
  },
  {
    test: (pathname) => pathname.startsWith("/topic"),
    meta: {
      title: "주제",
      hint: "한 문서를 길게 읽고, 핵심 개념과 다음 탐구로 이어지는 읽기 뷰입니다.",
      fileName: "topic-note.md",
      outline: ["요약", "핵심 본문", "주요 개념", "자가 검토", "다음 탐구"],
      links: ["여정 보기", "서고에 보관", "연관 주제로 확장"],
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
    test: (pathname) => pathname.startsWith("/library"),
    meta: {
      title: "서고",
      hint: "복습할 노트, 저장한 주제, 최근 기록이 축적되는 개인 vault입니다.",
      fileName: "vault-index.md",
      outline: ["복습 큐", "최근 탐구", "보관된 주제", "마스터 아카이브"],
      links: ["최근 노트 다시 열기", "보관 주제 정리", "작업실로 보내기"],
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
    test: (pathname) => pathname.startsWith("/workspace"),
    meta: {
      title: "작업실",
      hint: "노트, 출처, 질문을 연결하면서 생각을 구조화하는 연구 보드입니다.",
      fileName: "workspace-canvas.md",
      outline: ["핵심 질문", "논점 보드", "출처", "작업 메모", "다음 행동"],
      links: ["주제 카드 열기", "출처 정리", "서고에 아카이브"],
    },
  },
];

function resolveSection(pathname: string): SectionMeta {
  return sections.find((section) => section.test(pathname))?.meta ?? sections[0].meta;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentSection = resolveSection(pathname);

  return (
    <div className="page-shell">
      <aside className="vault-sidebar">
        <div className="vault-header">
          <Link href="/" className="vault-brand">
            <span className="vault-brand__mark">IK</span>
            <span className="vault-brand__text">
              <strong>지식 서고</strong>
              <small>linked learning workspace</small>
            </span>
          </Link>

          <section className="vault-panel">
            <span className="vault-panel__eyebrow">현재 문맥</span>
            <strong className="vault-panel__title">{currentSection.title}</strong>
            <p className="vault-panel__hint">{currentSection.hint}</p>
          </section>
        </div>

        <HeaderNav />

        <section className="vault-panel" style={{ marginTop: "auto" }}>
          <span className="vault-panel__eyebrow">고정 메모</span>
          <ul className="vault-mini-list">
            <li>하나의 노트에서 시작하기</li>
            <li>연결을 따라 다음 질문 찾기</li>
            <li>읽은 내용은 서고에 남기기</li>
          </ul>
        </section>
      </aside>

      <main className="main-canvas">
        <header className="canvas-header">
          <div className="canvas-breadcrumb" aria-label="문서 경로">
            <span>vault</span>
            <span>/</span>
            <span>{currentSection.title}</span>
          </div>
          <span className="canvas-tab">{currentSection.fileName}</span>
        </header>
        <div className="canvas-content">
          {children}
        </div>
      </main>

      <aside className="context-sidebar">
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
      </aside>
    </div>
  );
}
