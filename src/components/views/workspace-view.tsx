"use client";

import Link from "next/link";
import { TopicCard } from "@/components/topic-card";
import type { Topic, Workspace } from "@/lib/domain";

export function WorkspaceView({
  workspace,
  topics,
}: {
  workspace: Workspace;
  topics: Topic[];
}) {
  const bySlug = new Map(topics.map((topic) => [topic.slug, topic]));
  const savedTopics = workspace.savedTopicSlugs
    .map((slug) => bySlug.get(slug))
    .filter(Boolean) as Topic[];
  
  const suggestedLinks = savedTopics
    .flatMap((topic) => topic.related)
    .map((slug) => bySlug.get(slug))
    .filter((topic): topic is Topic => Boolean(topic))
    .filter(
      (topic, index, collection) =>
        !savedTopics.some((savedTopic) => savedTopic.slug === topic.slug) &&
        collection.findIndex((item) => item.slug === topic.slug) === index,
    ) as Topic[];

  return (
    <section className="view" style={{ paddingBottom: 0 }}>
      <header className="stack" style={{ gap: 'var(--space-4)', maxWidth: '1000px', marginBottom: 'var(--space-8)' }}>
        <div className="chip-row">
          <span className="caption" style={{ color: 'var(--accent)' }}>RESEARCH STUDIO</span>
          {workspace.relatedDomains.map((domain) => (
            <span key={domain} className="chip chip--alt">
              {domain}
            </span>
          ))}
        </div>
        <div className="stack" style={{ gap: 'var(--space-2)' }}>
          <h1 className="hero-title" style={{ fontSize: '3rem' }}>{workspace.title}</h1>
          <p className="hero-copy" style={{ fontSize: '1.25rem', color: 'var(--text-strong)', borderLeft: '3px solid var(--accent)', paddingLeft: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            {workspace.focusQuestion}
          </p>
        </div>
      </header>

      <div className="workspace-panel">
        <main className="panel-main stack" style={{ gap: 'var(--space-12)' }}>
          {/* Evidence Grid */}
          <section className="stack" style={{ gap: 'var(--space-8)' }}>
            <div className="section-head">
              <span className="caption">Synthesis Board</span>
              <h2 className="section-title">Verified Evidence & Logic</h2>
            </div>
            
            <div className="stack" style={{ gap: 'var(--space-12)' }}>
              <div className="stack" style={{ gap: 'var(--space-4)' }}>
                <span className="caption" style={{ color: 'var(--text-muted)' }}>CORE ARGUMENTS</span>
                <div className="stack" style={{ gap: 'var(--space-2)' }}>
                  {workspace.questionList.map((q, i) => (
                    <div key={i} className="surface" style={{ padding: 'var(--space-5)', background: 'var(--bg-subtle)', borderLeft: '3px solid var(--line-strong)' }}>
                      <span style={{ color: 'var(--accent)', marginRight: 'var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800 }}>0{i+1}</span>
                      <span style={{ fontSize: '1rem', color: 'var(--text-base)' }}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stack" style={{ gap: 'var(--space-4)' }}>
                <span className="caption" style={{ color: 'var(--text-muted)' }}>DEBATE ARCHITECTURE</span>
                <div className="grid-2">
                  {workspace.debateMap.map((item) => (
                    <div key={item.title} className="surface-elevated" style={{ padding: 'var(--space-6)' }}>
                      <strong style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '1rem', color: 'var(--text-strong)' }}>{item.title}</strong>
                      <p className="muted" style={{ fontSize: '0.9rem' }}>{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stack" style={{ gap: 'var(--space-4)' }}>
                <span className="caption" style={{ color: 'var(--text-muted)' }}>PRIMARY SOURCES</span>
                <div className="stack" style={{ gap: 'var(--space-2)' }}>
                  {workspace.savedSources.map((source) => (
                    <div key={source.title} className="surface card-interactive" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)' }}>
                      <div className="stack" style={{ gap: '0' }}>
                        <strong style={{ fontSize: '1rem' }}>{source.title}</strong>
                        <span className="muted" style={{ fontSize: '0.8rem' }}>{source.publisher} · {source.type}</span>
                      </div>
                      <span className="chip" style={{ fontSize: '0.6rem' }}>REFERENCE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Contextual Topics */}
          <section className="stack" style={{ gap: 'var(--space-6)' }}>
            <div className="section-head">
              <h2 className="section-title">Connected Knowledge</h2>
              <p className="muted">서고에서 이 연구와 관련된 활성 스레드를 가져왔습니다.</p>
            </div>
            <div className="grid-2">
              {savedTopics.map((topic) => (
                <TopicCard key={topic.slug} topic={topic} />
              ))}
            </div>
          </section>
        </main>

        <aside className="panel-aside stack" style={{ gap: 'var(--space-12)' }}>
          <section className="stack" style={{ gap: 'var(--space-4)' }}>
            <span className="caption" style={{ color: 'var(--accent)' }}>Active Draft</span>
            <div className="stack" style={{ gap: 'var(--space-4)' }}>
              {workspace.noteBlocks.map((note, i) => (
                <div key={i} className="surface" style={{ padding: 'var(--space-5)', background: 'var(--bg)', boxShadow: 'var(--shadow-sm)' }}>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-base)' }}>{note}</p>
                </div>
              ))}
              <textarea 
                className="plain-input" 
                placeholder="새로운 통찰을 추가하십시오..."
                style={{ minHeight: '200px', fontSize: '1rem', borderStyle: 'dashed', background: 'transparent' }}
              />
              <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>보드에 기록하기</button>
            </div>
          </section>

          <section className="stack" style={{ gap: 'var(--space-6)' }}>
            <span className="caption">Suggested Vectors</span>
            <div className="chip-row">
              {suggestedLinks.slice(0, 10).map((topic) => (
                <Link key={topic.slug} href={`/topic/${topic.slug}`} className="chip chip--alt card-interactive" style={{ textDecoration: 'none' }}>
                  {topic.title}
                </Link>
              ))}
            </div>
          </section>

          <section className="stack" style={{ gap: 'var(--space-4)' }}>
            <span className="caption">Next Actions</span>
            <div className="stack" style={{ gap: 'var(--space-2)' }}>
              <div className="surface" style={{ fontSize: '0.9rem', padding: 'var(--space-4)', background: 'var(--bg)', display: 'flex', gap: 'var(--space-3)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>→</span>
                <span>핵심 주장에 대한 데이터 보강</span>
              </div>
              <div className="surface" style={{ fontSize: '0.9rem', padding: 'var(--space-4)', background: 'var(--bg)', display: 'flex', gap: 'var(--space-3)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>→</span>
                <span>인접 지식과의 브리지 형성</span>
              </div>
              <div className="surface" style={{ fontSize: '0.9rem', padding: 'var(--space-4)', background: 'var(--bg)', display: 'flex', gap: 'var(--space-3)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>→</span>
                <span>종합 결론 도출 및 아카이빙</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
