"use client";

import Link from "next/link";
import { useState } from "react";

import type { GuidePreset, GuideRecommendation, Topic } from "@/lib/domain";
import { formatDepth } from "@/lib/utils";

export function GuideView({
  presets,
  initialRecommendation,
  topics,
}: {
  presets: GuidePreset[];
  initialRecommendation: GuideRecommendation;
  topics: Topic[];
}) {
  const [query, setQuery] = useState(presets[0]?.query ?? "");
  const [recommendation, setRecommendation] =
    useState<GuideRecommendation>(initialRecommendation);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bySlug = new Map(topics.map((topic) => [topic.slug, topic]));

  const querySignals = getQuerySignals(query);
  const pathTopics = recommendation.path
    .map((topicSlug) => bySlug.get(topicSlug))
    .filter(Boolean) as Topic[];
  const bridgeTopics = recommendation.bridges
    .map((topicSlug) => bySlug.get(topicSlug))
    .filter(Boolean) as Topic[];
  const recommendedStartTopic = bySlug.get(recommendation.startTopicSlug);
  const mapNodes = [
    recommendedStartTopic ? { label: recommendedStartTopic.title, tone: "accent" } : null,
    ...pathTopics.slice(0, 3).map((topic) => ({ label: topic.title, tone: "soft" as const })),
    ...bridgeTopics.slice(0, 2).map((topic) => ({ label: topic.title, tone: "alt" as const })),
  ].filter(Boolean) as Array<{ label: string; tone: "accent" | "soft" | "alt" }>;

  async function handleGenerate(nextQuery = query) {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: nextQuery }),
      });

      if (!response.ok) {
        throw new Error("추천을 불러오지 못했습니다.");
      }

      const data = (await response.json()) as GuideRecommendation;
      setRecommendation(data);
    } catch {
      setError("추천 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="view">
      <header className="stack" style={{ gap: 'var(--space-8)', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div className="stack" style={{ gap: 'var(--space-4)' }}>
          <span className="caption" style={{ color: 'var(--accent)' }}>EXPLORATION GUIDE</span>
          <h1 className="hero-title">체계적 탐구를 위한 설계</h1>
          <p className="hero-copy" style={{ margin: '0 auto' }}>
            현재 상태와 도달하고 싶은 지점을 적어주십시오. 가장 자연스러운 시작점과 
            지식의 고리를 이어주는 여정을 설계해 드립니다.
          </p>
        </div>
        
        <div className="stack" style={{ gap: 'var(--space-6)' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="예: 프랑스 혁명을 교양 수준에서 정치철학까지 연결하고 싶음"
              className="plain-input"
              style={{ 
                padding: '24px 32px', 
                fontSize: '1.25rem', 
                textAlign: 'center',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
          </div>
          <div className="chip-row" style={{ justifyContent: 'center' }}>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`chip ${query === preset.query ? "chip--accent" : ""}`}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => {
                  setQuery(preset.query);
                  void handleGenerate(preset.query);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ padding: '16px 40px', fontSize: '1rem' }} 
            onClick={() => void handleGenerate()}
            disabled={isPending}
          >
            {isPending ? "여정 설계 중..." : "여정 설계하기"}
          </button>
        </div>
      </header>

      <div className="feature-grid" style={{ marginTop: 'var(--space-16)' }}>
        <section className="stack" style={{ gap: 'var(--space-12)' }}>
          <article className="sheet stack" style={{ gap: 'var(--space-8)' }}>
            <div className="section-head">
              <span className="caption" style={{ color: 'var(--accent)' }}>제안된 경로</span>
              <h2 className="section-title" style={{ fontSize: '2.5rem', marginTop: 'var(--space-2)' }}>{recommendation.title}</h2>
              <p className="hero-copy" style={{ fontSize: '1.2rem', marginTop: 'var(--space-4)' }}>{recommendation.summary}</p>
            </div>

            {error && (
              <div style={{ padding: 'var(--space-4)', background: 'var(--accent-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-border)' }}>
                <p style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>{error}</p>
              </div>
            )}

            <div className="metrics">
              <article className="metric">
                <strong>{formatDepth(recommendation.recommendedDepth).toUpperCase()}</strong>
                <span>권장 시작 깊이</span>
              </article>
              <article className="metric">
                <strong>{recommendedStartTopic?.title ?? "-"}</strong>
                <span>권장 시작 주제</span>
              </article>
            </div>

            <div className="stack" style={{ gap: 'var(--space-4)' }}>
              <span className="caption">여정의 지형</span>
              <div className="chip-row">
                {mapNodes.map((node, index) => (
                  <span 
                    key={`${node.label}-${index}`} 
                    className={`chip ${node.tone === 'accent' ? 'chip--accent' : node.tone === 'alt' ? 'chip--alt' : ''}`}
                    style={{ padding: '6px 12px' }}
                  >
                    {node.label}
                  </span>
                ))}
              </div>
            </div>

            <footer style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--line)', paddingTop: 'var(--space-8)' }}>
              <div className="hero-actions">
                <Link href={`/topic/${recommendation.startTopicSlug}`} className="btn btn-primary" style={{ padding: '14px 32px' }}>
                  첫 주제 탐구 시작하기
                </Link>
                <Link
                  href={`/path/${recommendation.path[0] ?? recommendation.startTopicSlug}`}
                  className="btn btn-secondary"
                  style={{ padding: '14px 32px' }}
                >
                  전체 여정 보기
                </Link>
              </div>
            </footer>
          </article>

          <section className="stack" style={{ gap: 'var(--space-6)' }}>
            <div className="section-head">
              <h2 className="section-title">학습 경로</h2>
              <p className="muted">목표 달성을 위한 단계별 이정표입니다.</p>
            </div>
            <div className="stack" style={{ gap: 'var(--space-3)' }}>
              {pathTopics.map((topic, index) => (
                <Link 
                  key={topic.slug} 
                  href={`/topic/${topic.slug}`} 
                  className="surface card-interactive" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'var(--space-2)', 
                    textDecoration: 'none',
                    padding: 'var(--space-6)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--text-strong)', fontSize: '1.15rem' }}>{index + 1}. {topic.title}</strong>
                    <span className="chip" style={{ fontSize: '0.6rem' }}>탐구하기 →</span>
                  </div>
                  <p className="muted">{topic.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        </section>

        <aside className="stack" style={{ gap: 'var(--space-8)' }}>
          <section className="surface-elevated" style={{ padding: 'var(--space-6)' }}>
            <span className="caption">설계 의도</span>
            <div className="stack" style={{ gap: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
              {recommendation.reasons.map((reason, i) => (
                <div key={i} className="stack" style={{ gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800 }}>STRATEGY 0{i+1}</span>
                  <p style={{ fontSize: '1rem', color: 'var(--text-strong)', lineHeight: '1.6' }}>{reason}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface" style={{ padding: 'var(--space-6)' }}>
            <span className="caption">브리지 주제</span>
            <p className="muted" style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: '0.9rem' }}>
              분야를 넘나드는 연결점들입니다.
            </p>
            <div className="chip-row">
              {bridgeTopics.length ? (
                bridgeTopics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/topic/${topic.slug}`}
                    className="chip chip--alt card-interactive"
                    style={{ textDecoration: 'none' }}
                  >
                    {topic.title}
                  </Link>
                ))
              ) : (
                <span className="chip">추천된 브리지가 없습니다.</span>
              )}
            </div>
          </section>

          <section className="surface" style={{ padding: 'var(--space-6)' }}>
            <span className="caption">입력 신호 분석</span>
            <div className="chip-row" style={{ marginTop: 'var(--space-4)' }}>
              {querySignals.length ? (
                querySignals.map((signal) => (
                  <span key={signal} className="chip chip--accent">{signal}</span>
                ))
              ) : (
                <span className="chip">기본 여정 탐색 중</span>
              )}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function getQuerySignals(query: string) {
  const value = query.toLowerCase();
  const signals = new Set<string>();

  if (value.includes("블랙홀") || value.includes("우주") || value.includes("수학")) {
    signals.add("천문학");
  }

  if (value.includes("혁명") || value.includes("역사")) {
    signals.add("역사");
  }

  if (value.includes("철학") || value.includes("정당")) {
    signals.add("철학");
  }

  if (value.includes("가볍게") || value.includes("입문") || value.includes("모르")) {
    signals.add("입문");
  }

  if (value.includes("연구") || value.includes("논문")) {
    signals.add("심화");
  }

  return [...signals];
}
