"use client";

import Link from "next/link";

import { useLibrary } from "@/components/providers/library-provider";
import type { Topic } from "@/lib/domain";
import { formatDepth } from "@/lib/utils";

export function LibraryView({ topics }: { topics: Topic[] }) {
  const { savedSlugs, recentSlugs, notes, layerProgress, toggleSave } = useLibrary();
  const bySlug = new Map(topics.map((topic) => [topic.slug, topic]));
  const savedTopics = savedSlugs.map((slug) => bySlug.get(slug)).filter(Boolean) as Topic[];
  const recentTopics = recentSlugs.map((slug) => bySlug.get(slug)).filter(Boolean) as Topic[];
  
  const noteEntries = Object.entries(notes)
    .map(([topicSlug, content]) => ({ topic: bySlug.get(topicSlug), content }))
    .filter((entry) => entry.topic && entry.content) as Array<{ topic: Topic; content: string }>;
  
  const journeyTopics = [...recentTopics, ...savedTopics].filter(
    (topic, index, collection) => collection.findIndex((item) => item.slug === topic.slug) === index,
  );

  const resumeTopic = recentTopics[0] ?? savedTopics[0] ?? topics[0];

  const reviewDeck = [
    {
      type: "RESUME",
      label: resumeTopic ? resumeTopic.title : "Ready to Start",
      body: resumeTopic
        ? `${formatDepth(layerProgress[resumeTopic.slug] ?? "light").toUpperCase()} 단계에서 중단됨. 탐구를 재개하십시오.`
        : "첫 주제를 열어 학습의 궤적을 만드십시오.",
      href: resumeTopic ? `/topic/${resumeTopic.slug}` : "/",
      cta: "탐구 재개",
      accent: "var(--accent)"
    },
    {
      type: "REFLECT",
      label: noteEntries[0]?.topic.title ?? "Capture Thoughts",
      body: noteEntries[0]
        ? "기록된 노트를 복기하고 핵심 통찰을 한 문장으로 정리하십시오."
        : "주제에 노트를 남기면 복기 프롬프트가 활성화됩니다.",
      href: noteEntries[0] ? `/topic/${noteEntries[0].topic.slug}` : "/guide",
      cta: "노트 복기",
      accent: "var(--secondary)"
    },
    {
      type: "EXPAND",
      label: journeyTopics[0]?.title ?? "Bridge Knowledge",
      body: journeyTopics[0]
        ? `${journeyTopics[0].title}와(과) 연결된 새로운 지식의 고리를 확인하십시오.`
        : "주제를 저장하면 지식 확장 제안을 받을 수 있습니다.",
      href: journeyTopics[0] ? `/path/${journeyTopics[0].slug}` : "/topic/black-hole",
      cta: "연결망 확인",
      accent: "var(--success)"
    },
  ];

  return (
    <section className="view">
      <header className="stack" style={{ gap: 'var(--space-6)' }}>
        <div className="stack" style={{ gap: 'var(--space-4)' }}>
          <span className="caption" style={{ color: 'var(--accent)' }}>PERSONAL ARCHIVE</span>
          <h1 className="hero-title">지식의 서고</h1>
          <p className="hero-copy">
            당신이 탐구한 통찰과 궤적의 기록입니다. 
            서고는 단순한 저장소가 아닌, 새로운 사유가 시작되는 활성 작업판입니다.
          </p>
        </div>
        <div className="metrics" style={{ marginTop: 'var(--space-4)' }}>
          <div className="metric">
            <strong>{journeyTopics.length}</strong>
            <span>활성 궤적</span>
          </div>
          <div className="metric">
            <strong>{noteEntries.length}</strong>
            <span>기록된 통찰</span>
          </div>
        </div>
      </header>

      <section className="stack" style={{ gap: 'var(--space-6)' }}>
        <div className="section-head">
          <span className="caption">DAILY ROUTINE</span>
          <h2 className="section-title">활성 복기</h2>
        </div>
        <div className="grid-3">
          {reviewDeck.map((item) => (
            <article key={item.type} className="sheet card-interactive" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="caption" style={{ color: item.accent }}>{item.type}</span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.accent }}></div>
              </div>
              <div className="stack" style={{ gap: 'var(--space-2)' }}>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>{item.label}</strong>
                <p className="muted" style={{ fontSize: '0.95rem' }}>{item.body}</p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                <Link href={item.href} className="btn btn-ghost" style={{ padding: '0', fontSize: '0.9rem', color: 'var(--text-strong)', fontWeight: 800 }}>
                  {item.cta} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="feature-grid">
        <section className="stack" style={{ gap: 'var(--space-6)' }}>
          <div className="section-head">
            <h2 className="section-title">최근 탐구</h2>
          </div>
          <div className="stack" style={{ gap: 'var(--space-2)' }}>
            {recentTopics.length ? (
              recentTopics.slice(0, 5).map((topic) => (
                <Link 
                  key={topic.slug} 
                  href={`/topic/${topic.slug}`}
                  className="surface card-interactive"
                  style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5)' }}
                >
                  <div className="stack" style={{ gap: 'var(--space-1)' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-strong)' }}>{topic.title}</strong>
                    <span className="caption" style={{ fontSize: '0.65rem' }}>{topic.category}</span>
                  </div>
                  <span className="chip">{formatDepth(layerProgress[topic.slug] ?? "light")}</span>
                </Link>
              ))
            ) : (
              <div className="surface" style={{ padding: 'var(--space-12)', textAlign: 'center', borderStyle: 'dashed' }}>
                <p className="muted">최근 활동이 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        <section className="stack" style={{ gap: 'var(--space-6)' }}>
          <div className="section-head">
            <h2 className="section-title">보관된 주제</h2>
          </div>
          <div className="grid-2">
            {savedTopics.length ? (
              savedTopics.slice(0, 4).map((topic) => (
                <div key={topic.slug} className="surface-elevated card-interactive" style={{ padding: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                    <span className="caption" style={{ fontSize: '0.6rem' }}>{topic.category}</span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSave(topic.slug);
                      }} 
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800 }}
                    >
                      REMOVE
                    </button>
                  </div>
                  <Link href={`/topic/${topic.slug}`} style={{ textDecoration: 'none' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', color: 'var(--text-strong)' }}>{topic.title}</strong>
                    <p className="muted" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{topic.summary}</p>
                  </Link>
                </div>
              ))
            ) : (
              <div className="surface" style={{ padding: 'var(--space-12)', textAlign: 'center', borderStyle: 'dashed', gridColumn: 'span 2' }}>
                <p className="muted">보관된 주제가 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="stack" style={{ gap: 'var(--space-8)' }}>
        <div className="section-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--space-4)' }}>
          <h2 className="section-title">마스터 아카이브</h2>
        </div>
        <div className="stack" style={{ gap: '0' }}>
          {(journeyTopics.length ? journeyTopics : topics.slice(0, 10)).map((topic) => {
            const nextTopic = bySlug.get(topic.related[0] ?? "");
            const noteCount = noteEntries.filter((entry) => entry.topic.slug === topic.slug).length;

            return (
              <div 
                key={topic.slug} 
                className="card-interactive" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr auto',
                  alignItems: 'center',
                  padding: 'var(--space-6) var(--space-4)',
                  borderBottom: '1px solid var(--line)',
                  background: 'var(--bg)'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '1.05rem' }}>{topic.title}</strong>
                  <span className="caption" style={{ fontSize: '0.65rem' }}>{topic.category}</span>
                </div>
                <div className="stack" style={{ gap: 'var(--space-1)' }}>
                  <span className="caption" style={{ fontSize: '0.6rem', color: 'var(--text-low)' }}>DEPTH</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-strong)', fontWeight: 700 }}>{formatDepth(layerProgress[topic.slug] ?? "light").toUpperCase()}</span>
                </div>
                <div className="stack" style={{ gap: 'var(--space-1)' }}>
                  <span className="caption" style={{ fontSize: '0.6rem', color: 'var(--text-low)' }}>RECORDS</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-strong)', fontWeight: 700 }}>{noteCount} NOTES</span>
                </div>
                <div className="stack" style={{ gap: 'var(--space-1)' }}>
                  <span className="caption" style={{ fontSize: '0.6rem', color: 'var(--text-low)' }}>SEQUENTIAL</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{nextTopic?.title ?? "End of chain"}</span>
                </div>
                <Link href={`/topic/${topic.slug}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                  OPEN
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}
