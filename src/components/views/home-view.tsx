"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { TopicLinkCard } from "@/components/topic-link-card";
import { useLibrary } from "@/components/providers/library-provider";
import type { Topic } from "@/lib/domain";
import { formatDepth } from "@/lib/utils";

type HomeViewProps = {
  topics: Topic[];
  featuredTopics: Topic[];
  categories: string[];
};

export function HomeView({ topics, featuredTopics, categories }: HomeViewProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { recentSlugs, layerProgress } = useLibrary();

  const recentTopics = recentSlugs
    .map((slug) => topics.find((topic) => topic.slug === slug))
    .filter(Boolean) as Topic[];

  const primaryTopic = recentTopics[0] ?? featuredTopics[0] ?? topics[0];
  const primaryDepth = layerProgress[primaryTopic.slug] ?? "light";
  const linkedTopics = primaryTopic.related
    .map((slug) => topics.find((topic) => topic.slug === slug))
    .filter((topic): topic is Topic => Boolean(topic))
    .slice(0, 4);
  const quickResumeTopics =
    recentTopics.length > 0 ? recentTopics.slice(0, 4) : featuredTopics.slice(0, 4);
  const visibleCategories = categories.slice(0, 8);

  const visibleTopics = deferredQuery
    ? topics.filter((topic) =>
        [topic.title, topic.summary, topic.category, ...topic.tags]
          .join(" ")
          .toLowerCase()
          .includes(deferredQuery.toLowerCase()),
      )
    : featuredTopics;

  return (
    <section className="view note-page">
      <header className="note-page__header">
        <div className="chip-row">
          <span className="chip chip--accent">Start Note</span>
          <span className="chip">{primaryTopic.category}</span>
          <span className="chip chip--alt">{formatDepth(primaryDepth)}</span>
        </div>
        <h1 className="note-title">오늘 다시 열어둘 노트</h1>
        <p className="note-body">
          옵시디언처럼 하나의 중심 노트에서 시작하고, 연결된 문서와 태그를 따라가며
          학습을 넓히는 구조로 바꿨습니다. 이 화면은 대시보드가 아니라 지금 열어야
          할 문서를 바로 찾는 시작 페이지입니다.
        </p>
      </header>

      <div className="home-layout">
        <main className="home-main">
          <article className="note-card note-card--primary">
            <span className="note-card__eyebrow">열린 중심 노트</span>
            <div className="stack" style={{ gap: "var(--space-3)" }}>
              <h2 className="home-focus__title">{primaryTopic.title}</h2>
              <p className="home-focus__summary">{primaryTopic.summary}</p>
            </div>
            <div className="home-focus__meta">
              <div className="home-focus__meta-item">
                <span>현재 깊이</span>
                <strong>{formatDepth(primaryDepth)}</strong>
              </div>
              <div className="home-focus__meta-item">
                <span>연결된 노트</span>
                <strong>{linkedTopics.length}개</strong>
              </div>
              <div className="home-focus__meta-item">
                <span>대표 태그</span>
                <strong>{primaryTopic.tags[0] ?? primaryTopic.category}</strong>
              </div>
            </div>
            <div className="hero-actions">
              <Link href={`/topic/${primaryTopic.slug}`} className="btn btn-primary">
                노트 열기
              </Link>
              <Link href={`/path/${primaryTopic.slug}`} className="btn btn-secondary">
                여정 보기
              </Link>
            </div>
          </article>

          <section className="note-card">
            <div className="section-head">
              <span className="note-card__eyebrow">연결된 노트</span>
              <h2 className="section-title">지금 이 노트와 맞닿아 있는 문서</h2>
              <p className="muted">
                옵시디언의 백링크처럼, 현재 주제에서 자연스럽게 이어질 수 있는 연결을
                먼저 보여줍니다.
              </p>
            </div>
            <div className="stack" style={{ gap: "var(--space-3)" }}>
              {linkedTopics.length > 0 ? (
                linkedTopics.map((topic) => <TopicLinkCard key={topic.slug} topic={topic} />)
              ) : (
                <div className="surface" style={{ padding: "var(--space-5)" }}>
                  <p className="muted">아직 연결된 노트가 없습니다. 중심 노트부터 열어보세요.</p>
                </div>
              )}
            </div>
          </section>

          <section className="note-card">
            <div className="section-head">
              <span className="note-card__eyebrow">전체 탐색</span>
              <h2 className="section-title">주제와 태그를 문서처럼 탐색하기</h2>
            </div>
            <div className="search-container">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="주제 검색 또는 태그 입력..."
                className="search-input"
              />
            </div>
            <div className="home-topic-grid">
              {visibleTopics.slice(0, 6).map((topic) => (
                <Link key={topic.slug} href={`/topic/${topic.slug}`} className="home-note-row">
                  <div className="home-note-row__meta">
                    <strong className="home-note-row__title">{topic.title}</strong>
                    <p className="home-note-row__summary">{topic.summary}</p>
                  </div>
                  <span className="home-note-row__tail">{topic.category}</span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <aside className="home-aside">
          <section className="note-card">
            <span className="note-card__eyebrow">바로 이어보기</span>
            <div className="home-list">
              {quickResumeTopics.map((topic) => (
                <Link key={topic.slug} href={`/topic/${topic.slug}`} className="home-note-row">
                  <div className="home-note-row__meta">
                    <strong className="home-note-row__title">{topic.title}</strong>
                    <p className="home-note-row__summary">
                      {topic.category} · {topic.tags[0] ?? "탐구"}
                    </p>
                  </div>
                  <span className="home-note-row__tail">resume</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="note-card">
            <span className="note-card__eyebrow">탐색 태그</span>
            <div className="home-tag-grid">
              {visibleCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="btn"
                  onClick={() => setQuery(category)}
                >
                  #{category}
                </button>
              ))}
            </div>
          </section>

          <section className="note-card">
            <span className="note-card__eyebrow">오늘의 흐름</span>
            <div className="home-step-list">
              {[
                {
                  title: "중심 노트 열기",
                  body: `${primaryTopic.title}에서 현재 맥락을 다시 붙잡습니다.`,
                },
                {
                  title: "연결된 노트 따라가기",
                  body: `${linkedTopics[0]?.title ?? "연결된 주제"}로 이해 범위를 넓힙니다.`,
                },
                {
                  title: "서고에 기록 남기기",
                  body: "읽은 내용을 저장하고 다음 세션을 위한 단서를 남깁니다.",
                },
              ].map((item, index) => (
                <div key={item.title} className="home-step">
                  <span className="home-step__index">0{index + 1}</span>
                  <div className="home-step__content">
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
