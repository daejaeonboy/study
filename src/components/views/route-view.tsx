"use client";

import Link from "next/link";

import { useEditorial } from "@/components/providers/editorial-provider";
import { TopicLinkCard } from "@/components/topic-link-card";
import type { LearningPath, Topic } from "@/lib/domain";
import { formatDepth } from "@/lib/utils";

export function RouteView({
  path,
  topics,
}: {
  path: LearningPath;
  topics: Topic[];
}) {
  const { getTopic } = useEditorial();
  const resolvedTopics = topics.map(getTopic);
  const findTopic = (slug: string) => resolvedTopics.find((topic) => topic.slug === slug);
  const startTopic = findTopic(path.startTopicSlug);
  const currentTopic = findTopic(path.currentTopicSlug);
  const currentStep = path.steps.find((step) => step.status === "current") ?? path.steps[0];
  const nextStep =
    path.steps.find((step) => step.status === "suggested") ?? path.steps[path.steps.length - 1];
  const primaryNextTopic = findTopic(nextStep?.topicSlug ?? path.nextTopicSlugs[0] ?? path.currentTopicSlug);
  const completedCount = path.steps.filter((step) => step.status === "completed").length;
  const upcomingCount = path.steps.filter((step) => step.status === "suggested").length;

  function getStepLabel(status: LearningPath["steps"][number]["status"]) {
    if (status === "completed") {
      return "이미 지난 단계";
    }

    if (status === "current") {
      return "지금 보고 있는 단계";
    }

    return "다음에 열어볼 단계";
  }

  return (
    <section className="view">
      <header className="stack" style={{ gap: 'var(--space-8)' }}>
        <div className="stack" style={{ gap: 'var(--space-4)' }}>
          <span className="caption" style={{ color: 'var(--accent)' }}>KNOWLEDGE TRANSITION</span>
          <h1 className="hero-title">{path.title}</h1>
          <p className="hero-copy">{path.goal}</p>
        </div>
        
        <div className="hero-actions">
          {currentTopic && (
            <Link href={`/topic/${currentTopic.slug}`} className="btn btn-primary" style={{ padding: '14px 32px' }}>
              현재 단계 탐구 이어가기
            </Link>
          )}
          {primaryNextTopic && (
            <Link href={`/topic/${primaryNextTopic.slug}`} className="btn btn-secondary" style={{ padding: '14px 32px' }}>
              다음 전환 미리보기
            </Link>
          )}
        </div>

        <div className="grid-3" style={{ marginTop: 'var(--space-4)' }}>
          <article className="surface" style={{ padding: 'var(--space-6)' }}>
            <span className="caption">기점</span>
            <strong style={{ fontSize: '1.2rem', marginTop: 'var(--space-2)', display: 'block', color: 'var(--text-strong)' }}>{startTopic?.title ?? "-"}</strong>
            <p className="muted" style={{ marginTop: 'var(--space-1)', fontSize: '0.9rem' }}>탐구의 시작점</p>
          </article>
          <article className="surface-elevated" style={{ padding: 'var(--space-6)', border: '1px solid var(--accent-border)' }}>
            <span className="caption" style={{ color: 'var(--accent)' }}>현재 위치</span>
            <strong style={{ fontSize: '1.2rem', marginTop: 'var(--space-2)', display: 'block', color: 'var(--text-strong)' }}>{currentTopic?.title ?? "-"}</strong>
            <div className="chip-row" style={{ marginTop: 'var(--space-3)' }}>
              <span className="chip chip--accent">{formatDepth(currentStep?.depth ?? "light").toUpperCase()}</span>
            </div>
          </article>
          <article className="surface" style={{ padding: 'var(--space-6)' }}>
            <span className="caption">전환점</span>
            <strong style={{ fontSize: '1.2rem', marginTop: 'var(--space-2)', display: 'block', color: 'var(--text-strong)' }}>{primaryNextTopic?.title ?? "-"}</strong>
            <p className="muted" style={{ marginTop: 'var(--space-1)', fontSize: '0.9rem' }}>다음에 마주할 질문</p>
          </article>
        </div>
      </header>

      <div className="feature-grid" style={{ marginTop: 'var(--space-8)' }}>
        <section className="stack" style={{ gap: 'var(--space-8)' }}>
          <div className="section-head">
            <h2 className="section-title" style={{ fontSize: '2rem' }}>탐구의 궤적</h2>
            <p className="muted">단순한 목록이 아닌, 이해가 깊어지는 경로를 보여줍니다.</p>
          </div>
          
          <div className="stack" style={{ gap: 0, paddingLeft: '28px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '7px', top: '12px', bottom: '12px', width: '2px', background: 'var(--line-strong)' }} />
            
            {path.steps.map((step, index) => {
              const isActive = step.status === 'current';
              const isCompleted = step.status === 'completed';
              
              return (
                <article 
                  key={`${step.topicSlug}-${step.depth}`} 
                  style={{ 
                    position: 'relative',
                    paddingBottom: 'var(--space-12)',
                    paddingLeft: 'var(--space-12)'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    left: '-28px', 
                    top: '8px', 
                    width: '14px', 
                    height: '14px', 
                    borderRadius: '50%', 
                    background: isActive ? 'var(--accent)' : isCompleted ? 'var(--text-strong)' : 'var(--bg)',
                    border: `2px solid ${isActive ? 'var(--accent)' : 'var(--line-strong)'}`,
                    zIndex: 1,
                    boxShadow: isActive ? '0 0 0 4px var(--accent-soft)' : 'none'
                  }} />
                  
                  <div className={`sheet ${isActive ? 'active' : ''}`} style={{ 
                    padding: 'var(--space-8)',
                    borderColor: isActive ? 'var(--accent-border)' : 'var(--line-strong)',
                    background: isActive ? 'var(--bg)' : 'var(--bg-subtle)',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-4)' }}>
                      <div className="stack" style={{ gap: 'var(--space-1)' }}>
                        <span className="caption" style={{ color: isActive ? 'var(--accent)' : 'var(--text-low)' }}>
                          STEP {index + 1} · {getStepLabel(step.status)}
                        </span>
                        <h3 className="section-title">
                          {findTopic(step.topicSlug)?.title ?? step.topicSlug}
                        </h3>
                      </div>
                      <span className={`chip ${isActive ? 'chip--accent' : ''}`}>{formatDepth(step.depth).toUpperCase()}</span>
                    </div>
                    
                    <p className="hero-copy" style={{ fontSize: '1.1rem', marginBottom: 'var(--space-8)' }}>
                      {step.note}
                    </p>
                    
                    <div className="hero-actions">
                      <Link href={`/topic/${step.topicSlug}`} className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                        주제 탐구하기
                      </Link>
                      {isCompleted && <span className="chip" style={{ background: 'var(--success-soft)', color: 'var(--success)', borderColor: 'transparent' }}>탐구 완료</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="stack" style={{ gap: 'var(--space-8)' }}>
          <section className="surface-elevated" style={{ padding: 'var(--space-6)' }}>
            <span className="caption">진척 지표</span>
            <div className="stack" style={{ gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted">전체 주제</span>
                <strong style={{ color: 'var(--text-strong)' }}>{path.steps.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted">완료된 탐구</span>
                <strong style={{ color: 'var(--text-strong)' }}>{completedCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted">남은 여정</span>
                <strong style={{ color: 'var(--text-strong)' }}>{upcomingCount}</strong>
              </div>
              <div style={{ marginTop: 'var(--space-4)', height: '6px', background: 'var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(completedCount / path.steps.length) * 100}%`, height: '100%', background: 'var(--accent)' }} />
              </div>
            </div>
          </section>

          <section className="surface" style={{ padding: 'var(--space-6)' }}>
            <span className="caption">설계 원칙</span>
            <div className="stack" style={{ gap: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
              <div className="stack" style={{ gap: 'var(--space-2)' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--text-strong)', fontWeight: 800 }}>선수지식 우선</strong>
                <p className="muted" style={{ fontSize: '0.9rem' }}>진입 장벽을 낮추기 위한 배경 주제를 먼저 배치합니다.</p>
              </div>
              <div className="stack" style={{ gap: 'var(--space-2)' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--text-strong)', fontWeight: 800 }}>수직적 심화</strong>
                <p className="muted" style={{ fontSize: '0.9rem' }}>동일 주제 내에서 층위를 높인 후 다음 단계로 이동합니다.</p>
              </div>
            </div>
          </section>

          <section className="stack" style={{ gap: 'var(--space-4)' }}>
            <span className="caption">다음 전환 후보</span>
            <div className="stack" style={{ gap: 'var(--space-3)' }}>
              {path.nextTopicSlugs.slice(0, 3).map((slug) => {
                const topic = findTopic(slug);
                return topic ? <TopicLinkCard key={slug} topic={topic} /> : null;
              })}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
