"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useEditorial } from "@/components/providers/editorial-provider";
import { TopicLinkCard } from "@/components/topic-link-card";
import { useLibrary } from "@/components/providers/library-provider";
import type {
  CrossDomainLink,
  EditorialUser,
  LayerDepth,
  Topic,
  TopicSource,
  VerificationStatus,
} from "@/lib/domain";
import { canEditTopics } from "@/lib/editorial-permissions";
import { formatDepth, formatVerificationStatus } from "@/lib/utils";

const depthSequence: LayerDepth[] = ["light", "core", "deep"];
const verificationStatuses: VerificationStatus[] = [
  "generated",
  "reviewing",
  "verified",
  "published",
  "deprecated",
];

function parseCommaSeparated(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseParagraphs(value: string) {
  return value
    .split(/\n{2,}|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMultiline(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCrossDomainLinks(value: string): CrossDomainLink[] {
  return value
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [topicSlug, label, ...reasonParts] = row.split("|").map((item) => item.trim());

      if (!topicSlug || !label) {
        return null;
      }

      return {
        topicSlug,
        label,
        reason: reasonParts.join(" | "),
      };
    })
    .filter((item): item is CrossDomainLink => Boolean(item));
}

function serializeCrossDomainLinks(links: CrossDomainLink[]) {
  return links.map((link) => [link.topicSlug, link.label, link.reason].join(" | ")).join("\n");
}

function parseSources(value: string): TopicSource[] {
  return value
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [title, publisher, type, difficulty, trust, url, ...summaryParts] = row
        .split("|")
        .map((item) => item.trim());

      if (!title || !publisher || !type || !url) {
        return null;
      }

      const numericTrust = Number(trust);

      return {
        title,
        publisher,
        type,
        difficulty: difficulty || "기본",
        trust: Number.isFinite(numericTrust) ? numericTrust : 0,
        url,
        summary: summaryParts.join(" | "),
      };
    })
    .filter((item): item is TopicSource => Boolean(item));
}

function serializeSources(sources: TopicSource[]) {
  return sources
    .map((source) =>
      [
        source.title,
        source.publisher,
        source.type,
        source.difficulty,
        String(source.trust),
        source.url,
        source.summary,
      ].join(" | "),
    )
    .join("\n");
}

function TopicInlineEditor({
  topic,
  selectedLayer,
  currentUser,
  remotePersistenceEnabled,
  hasLocalOverride,
  onSave,
  onReset,
}: {
  topic: Topic;
  selectedLayer: LayerDepth;
  currentUser: EditorialUser;
  remotePersistenceEnabled: boolean;
  hasLocalOverride: boolean;
  onSave: (topic: Topic) => void;
  onReset: (slug: string) => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(topic);
  const [baseRevision, setBaseRevision] = useState(topic.revision ?? 1);
  const [notice, setNotice] = useState<string | null>(null);
  const [isRemoteSaving, setIsRemoteSaving] = useState(false);
  const currentLayer = draft.layers[selectedLayer];

  useEffect(() => {
    setDraft(topic);
    setBaseRevision(topic.revision ?? 1);
    setNotice(null);
  }, [topic]);

  function updateField<Key extends keyof Topic>(field: Key, value: Topic[Key]) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateLayerField<Key extends keyof Topic["layers"][LayerDepth]>(
    field: Key,
    value: Topic["layers"][LayerDepth][Key],
  ) {
    setDraft((current) => ({
      ...current,
      layers: {
        ...current.layers,
        [selectedLayer]: {
          ...current.layers[selectedLayer],
          [field]: value,
        },
      },
    }));
  }

  function buildLocalDraft() {
    return {
      ...draft,
      verificationStatus: draft.verificationStatus ?? "reviewing",
      sourceOrigin: draft.sourceOrigin?.trim() ? draft.sourceOrigin : "local-override",
      revision: (draft.revision ?? 1) + 1,
      lastReviewedAt: new Date().toISOString(),
    };
  }

  function handleLocalSave() {
    const savedTopic = buildLocalDraft();

    onSave(savedTopic);
    setDraft(savedTopic);
    setBaseRevision(savedTopic.revision ?? baseRevision);
    setNotice("로컬 저장됨");
  }

  async function handleRemoteSave() {
    setIsRemoteSaving(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/topics/${draft.slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: {
            ...draft,
            sourceOrigin: draft.sourceOrigin?.trim() ? draft.sourceOrigin : `editor:${currentUser.id}`,
            lastReviewedAt: new Date().toISOString(),
          },
          baseRevision,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            topic?: Topic;
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "저장 실패");
      }

      const savedTopic = payload?.topic ?? draft;
      onSave(savedTopic);
      setDraft(savedTopic);
      setBaseRevision(savedTopic.revision ?? baseRevision);
      setNotice("공유 저장됨");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "저장 실패");
    } finally {
      setIsRemoteSaving(false);
    }
  }

  function handleReset() {
    onReset(topic.slug);
    setNotice("초기화됨");
  }

  return (
    <div className="stack" style={{ gap: "var(--space-4)" }}>
      <section className="surface-elevated sidebar-card">
        <div className="stack" style={{ gap: "var(--space-3)" }}>
          <div className="chip-row">
            <span className="chip chip--accent">{currentUser.displayName}</span>
            <span className="chip">{formatVerificationStatus(draft.verificationStatus ?? "generated")}</span>
            {hasLocalOverride ? <span className="chip">로컬 편집</span> : null}
          </div>

          <div className="hero-actions" style={{ justifyContent: "space-between" }}>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              초기화
            </button>
            <div className="hero-actions">
              <button type="button" className="btn btn-secondary" onClick={handleLocalSave}>
                로컬 저장
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRemoteSave}
                disabled={!remotePersistenceEnabled || isRemoteSaving}
              >
                {isRemoteSaving ? "저장 중..." : "공유 저장"}
              </button>
            </div>
          </div>

          {notice ? <span className="caption">{notice}</span> : null}
        </div>
      </section>

      <section className="surface sidebar-card">
        <div className="stack" style={{ gap: "var(--space-3)" }}>
          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">제목</span>
            <input
              className="plain-input"
              value={draft.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">요약</span>
            <textarea
              className="plain-input note-area"
              value={draft.summary}
              onChange={(event) => updateField("summary", event.target.value)}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">중요성</span>
            <textarea
              className="plain-input note-area"
              value={draft.importance}
              onChange={(event) => updateField("importance", event.target.value)}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">상태</span>
            <select
              className="plain-input"
              value={draft.verificationStatus ?? "generated"}
              onChange={(event) =>
                updateField("verificationStatus", event.target.value as VerificationStatus)
              }
            >
              {verificationStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatVerificationStatus(status)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="surface sidebar-card">
        <div className="stack" style={{ gap: "var(--space-3)" }}>
          <span className="caption sidebar-card__title">
            {formatDepth(selectedLayer).toUpperCase()}
          </span>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">제목</span>
            <input
              className="plain-input"
              value={currentLayer.title}
              onChange={(event) => updateLayerField("title", event.target.value)}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">설명</span>
            <textarea
              className="plain-input note-area"
              value={currentLayer.description}
              onChange={(event) => updateLayerField("description", event.target.value)}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">본문</span>
            <textarea
              className="plain-input note-area"
              value={currentLayer.body.join("\n\n")}
              onChange={(event) => updateLayerField("body", parseParagraphs(event.target.value))}
              style={{ minHeight: "220px" }}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">핵심 개념</span>
            <input
              className="plain-input"
              value={currentLayer.keyIdeas.join(", ")}
              onChange={(event) => updateLayerField("keyIdeas", parseCommaSeparated(event.target.value))}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">질문</span>
            <textarea
              className="plain-input note-area"
              value={(currentLayer.questions ?? []).join("\n")}
              onChange={(event) => updateLayerField("questions", parseMultiline(event.target.value))}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">브리지</span>
            <textarea
              className="plain-input note-area"
              value={currentLayer.bridgePrompt}
              onChange={(event) => updateLayerField("bridgePrompt", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="surface sidebar-card">
        <div className="stack" style={{ gap: "var(--space-3)" }}>
          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">태그</span>
            <input
              className="plain-input"
              value={draft.tags.join(", ")}
              onChange={(event) => updateField("tags", parseCommaSeparated(event.target.value))}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">선수지식</span>
            <input
              className="plain-input"
              value={draft.prerequisites.join(", ")}
              onChange={(event) =>
                updateField("prerequisites", parseCommaSeparated(event.target.value))
              }
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">관련</span>
            <input
              className="plain-input"
              value={draft.related.join(", ")}
              onChange={(event) => updateField("related", parseCommaSeparated(event.target.value))}
            />
          </label>

          <label className="stack" style={{ gap: "6px" }}>
            <span className="caption">브리지</span>
            <textarea
              className="plain-input note-area"
              value={serializeCrossDomainLinks(draft.crossDomainLinks)}
              onChange={(event) =>
                updateField("crossDomainLinks", parseCrossDomainLinks(event.target.value))
              }
            />
          </label>
        </div>
      </section>

      <section className="surface sidebar-card">
        <label className="stack" style={{ gap: "6px" }}>
          <span className="caption">출처</span>
          <textarea
            className="plain-input note-area"
            value={serializeSources(draft.sources)}
            onChange={(event) => updateField("sources", parseSources(event.target.value))}
            style={{ minHeight: "200px" }}
          />
        </label>
      </section>
    </div>
  );
}

export function TopicView({
  topic,
  topics,
  editorialUser,
  remotePersistenceEnabled,
}: {
  topic: Topic;
  topics: Topic[];
  editorialUser?: EditorialUser | null;
  remotePersistenceEnabled?: boolean;
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
  const { getTopic, saveTopic, resetTopic, hasOverride } = useEditorial();
  const resolvedTopic = getTopic(topic);
  const resolvedTopics = topics.map(getTopic);
  const [isEditMode, setIsEditMode] = useState(false);
  const canEdit = editorialUser ? canEditTopics(editorialUser.role) : false;

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
          {canEdit ? <span className="chip chip--accent">{editorialUser?.role}</span> : null}
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
          {canEdit ? (
            <button
              type="button"
              className={`btn ${isEditMode ? "btn-secondary" : "btn-primary"}`}
              onClick={() => setIsEditMode((current) => !current)}
            >
              {isEditMode ? "편집 닫기" : "편집"}
            </button>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(`/topic/${resolvedTopic.slug}`)}`}
              className="btn btn-secondary"
            >
              운영 로그인
            </Link>
          )}
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
          {canEdit && isEditMode && editorialUser ? (
            <TopicInlineEditor
              topic={resolvedTopic}
              selectedLayer={selectedLayer}
              currentUser={editorialUser}
              remotePersistenceEnabled={Boolean(remotePersistenceEnabled)}
              hasLocalOverride={hasOverride(resolvedTopic.slug)}
              onSave={saveTopic}
              onReset={resetTopic}
            />
          ) : (
            <>
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
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
