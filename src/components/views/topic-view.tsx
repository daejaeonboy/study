"use client";

import Link from "next/link";
import { useEffect, useEffectEvent } from "react";

import { useEditorial } from "@/components/providers/editorial-provider";
import { TopicLinkCard } from "@/components/topic-link-card";
import { useLibrary } from "@/components/providers/library-provider";
import type { LayerDepth, Topic } from "@/lib/domain";
import { formatDepth, formatVerificationStatus } from "@/lib/utils";

const depthSequence: LayerDepth[] = ["light", "core", "deep"];

export function TopicView({
  topic,
  topics,
}: {
  topic: Topic;
  topics: Topic[];
}) {
  const {
    savedSlugs,
    notes,
    layerProgress,
    toggleSave,
    setNote,
    markRecent,
    setLayerProgress,
  } = useLibrary();
  const { getTopic } = useEditorial();
  const resolvedTopic = getTopic(topic);
  const resolvedTopics = topics.map(getTopic);

  const selectedLayer = layerProgress[resolvedTopic.slug] ?? "light";
  const currentLayer = resolvedTopic.layers[selectedLayer];
  const currentLayerIndex = depthSequence.indexOf(selectedLayer);
  const previousDepth = currentLayerIndex > 0 ? depthSequence[currentLayerIndex - 1] : null;
  const nextDepth =
    currentLayerIndex < depthSequence.length - 1 ? depthSequence[currentLayerIndex + 1] : null;
  const isSaved = savedSlugs.includes(resolvedTopic.slug);
  const verificationLabel = resolvedTopic.verificationStatus
    ? formatVerificationStatus(resolvedTopic.verificationStatus)
    : null;

  const findTopic = (slug: string) => resolvedTopics.find((item) => item.slug === slug);
  const fallbackQuestions = [
    "이 주제의 핵심을 한 문장으로 말할 수 있습니까?",
    "지금 단계의 핵심 포인트를 내 말로 다시 설명할 수 있습니까?",
    "다음 깊이로 이동할 준비가 되었습니까?",
  ];
  const selfCheckQuestions = currentLayer.questions?.length
    ? currentLayer.questions
    : fallbackQuestions;

  const markRecentEvent = useEffectEvent((topicSlug: string) => {
    markRecent(topicSlug);
  });

  useEffect(() => {
    markRecentEvent(resolvedTopic.slug);
  }, [resolvedTopic.slug]);

  function selectLayer(depth: LayerDepth) {
    setLayerProgress(resolvedTopic.slug, depth);
  }

  return (
    <section className="view">
      <header className="topic-header">
        <div className="chip-row">
          <span className="chip chip--alt">{resolvedTopic.category}</span>
          <span className="chip chip--accent">LEVEL {formatDepth(selectedLayer)}</span>
          {verificationLabel ? <span className="chip">{verificationLabel}</span> : null}
          {resolvedTopic.revision ? <span className="chip">r{resolvedTopic.revision}</span> : null}
        </div>
        <div className="stack">
          <h1 className="hero-title">{resolvedTopic.title}</h1>
          <p className="hero-copy">{resolvedTopic.summary}</p>
          {resolvedTopic.editorialSummary ? (
            <p className="muted" style={{ maxWidth: "720px" }}>
              {resolvedTopic.editorialSummary}
            </p>
          ) : null}
        </div>
        <div className="hero-actions topic-header__actions">
          <button 
            type="button" 
            className={`btn ${isSaved ? 'btn-secondary' : 'btn-primary'}`} 
            onClick={() => toggleSave(resolvedTopic.slug)}
          >
            {isSaved ? "서고에서 꺼내기" : "서고에 보관"}
          </button>
          <Link href={`/path/${resolvedTopic.slug}`} className="btn btn-secondary">
            학습 여정 추적
          </Link>
        </div>
      </header>

      <div className="topic-layout">
        <div className="reading-shell">
          <nav className="depth-switcher" aria-label="읽기 깊이 전환">
            {depthSequence.map((depth) => (
              <button
                key={depth}
                type="button"
                className={`depth-switcher__button ${selectedLayer === depth ? 'active' : ''}`}
                onClick={() => selectLayer(depth)}
              >
                {formatDepth(depth).toUpperCase()}
              </button>
            ))}
          </nav>

          <article className="sheet reading-area">
            <div className="reading-area__rail" aria-hidden="true" />
            
            <div className="reading-lead">
              <span className="caption reading-lead__eyebrow">{formatDepth(selectedLayer).toUpperCase()} ARGUMENT</span>
              <h2 className="section-title reading-lead__title">{currentLayer.title}</h2>
              <p className="hero-copy reading-lead__summary">{currentLayer.description}</p>
            </div>
            
            <div className="reading-body">
              {currentLayer.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <footer className="reading-footer">
              <div className="reading-footer__actions">
                <div>
                  {previousDepth && (
                    <button className="btn btn-secondary" onClick={() => selectLayer(previousDepth)}>
                      ← {formatDepth(previousDepth).toUpperCase()}
                    </button>
                  )}
                </div>
                <div>
                  {nextDepth && (
                    <button className="btn btn-primary" onClick={() => selectLayer(nextDepth)}>
                      {formatDepth(nextDepth).toUpperCase()}로 심화하기 →
                    </button>
                  )}
                </div>
              </div>
            </footer>
          </article>
        </div>

        <aside className="reading-sidebar">
          <section className="surface-elevated sidebar-card">
            <span className="caption sidebar-card__title sidebar-card__title--strong">주요 개념</span>
            <div className="idea-list">
              {currentLayer.keyIdeas.map((idea) => (
                <div key={idea} className="idea-list__item">
                  <span className="idea-list__dot" />
                  <span>{idea}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface sidebar-card">
            <span className="caption sidebar-card__title">자가 검토</span>
            <div className="review-list">
              {selfCheckQuestions.map((q, i) => (
                <div key={i} className="review-list__item muted">
                  <span className="review-list__index">{i + 1}</span>
                  {q}
                </div>
              ))}
            </div>
          </section>

          <section className="surface sidebar-card">
            <span className="caption sidebar-card__title">기록</span>
            <textarea
              className="plain-input note-area"
              value={notes[resolvedTopic.slug] ?? ""}
              onChange={(e) => setNote(resolvedTopic.slug, e.target.value, selectedLayer)}
              placeholder="탐구 중 발견한 통찰을 기록하십시오..."
            />
          </section>

          <section className="stack sidebar-card sidebar-card--ghost">
            <span className="caption sidebar-card__title">다음 탐구</span>
            <div className="stack sidebar-card__stack">
              {resolvedTopic.related.slice(0, 2).map((slug) => {
                const linked = findTopic(slug);
                return linked ? <TopicLinkCard key={slug} topic={linked} /> : null;
              })}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
