"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEditorial } from "@/components/providers/editorial-provider";
import type { CrossDomainLink, EditorialUser, LayerDepth, Topic, VerificationStatus } from "@/lib/domain";
import { formatVerificationStatus } from "@/lib/utils";

const layerSequence: LayerDepth[] = ["light", "core", "deep"];
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

function formatTimestamp(value?: string) {
  if (!value) {
    return "기록 없음";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function TopicEditorForm({
  topic,
  hasLocalOverride,
  currentUser,
  remotePersistenceEnabled,
  editorContext,
  onSave,
  onReset,
}: {
  topic: Topic;
  hasLocalOverride: boolean;
  currentUser: EditorialUser;
  remotePersistenceEnabled: boolean;
  editorContext: "workspace" | "topic-edit";
  onSave: (topic: Topic) => void;
  onReset: (slug: string) => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(topic);
  const [notice, setNotice] = useState<string | null>(null);
  const [baseRevision, setBaseRevision] = useState(topic.revision ?? 1);
  const [isRemoteSaving, setIsRemoteSaving] = useState(false);

  useEffect(() => {
    setDraft(topic);
    setBaseRevision(topic.revision ?? 1);
  }, [topic]);

  useEffect(() => {
    setNotice(null);
  }, [topic.slug]);

  function updateField<Key extends keyof Topic>(field: Key, value: Topic[Key]) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateLayer(depth: LayerDepth, nextLayer: Topic["layers"][LayerDepth]) {
    setDraft((current) => ({
      ...current,
      layers: {
        ...current.layers,
        [depth]: nextLayer,
      },
    }));
  }

  function buildSavedDraft(nextSourceOrigin: string) {
    return {
      ...draft,
      verificationStatus: draft.verificationStatus ?? "reviewing",
      sourceOrigin: draft.sourceOrigin?.trim() ? draft.sourceOrigin : nextSourceOrigin,
      revision: (draft.revision ?? 1) + 1,
      lastReviewedAt: new Date().toISOString(),
    };
  }

  function handleSave() {
    const savedTopic: Topic = buildSavedDraft("local-override");

    onSave(savedTopic);
    setDraft(savedTopic);
    setNotice("이 Topic의 편집본을 브라우저에 저장했습니다.");
  }

  async function handleRemoteSave() {
    const preparedTopic: Topic = {
      ...draft,
      verificationStatus: draft.verificationStatus ?? "reviewing",
      sourceOrigin: draft.sourceOrigin?.trim() ? draft.sourceOrigin : `editor:${currentUser.id}`,
      lastReviewedAt: new Date().toISOString(),
    };

    setIsRemoteSaving(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/topics/${preparedTopic.slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: preparedTopic,
          baseRevision,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            topic?: Topic;
            error?: string;
            currentRevision?: number;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Supabase 저장에 실패했습니다.");
      }

      const savedTopic = payload?.topic ?? preparedTopic;
      onSave(savedTopic);
      setDraft(savedTopic);
      setBaseRevision(savedTopic.revision ?? baseRevision);
      setNotice("Supabase와 브라우저 편집본에 함께 저장했습니다.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Supabase 저장에 실패했습니다.");
    } finally {
      setIsRemoteSaving(false);
    }
  }

  function handleReset() {
    onReset(topic.slug);
    setNotice("브라우저 저장 편집본을 지우고 원본으로 되돌렸습니다.");
  }

  return (
    <section className="stack" style={{ gap: "var(--space-8)" }}>
      <div
        className="surface-elevated"
        style={{
          padding: "var(--space-6)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--space-6)",
          flexWrap: "wrap",
        }}
      >
        <div className="stack" style={{ gap: "var(--space-2)" }}>
          <span className="caption" style={{ color: "var(--accent)" }}>
            EDITORIAL CONTROL
          </span>
          <h1 className="section-title" style={{ fontSize: "2rem" }}>
            {draft.title}
          </h1>
          <p className="muted" style={{ maxWidth: "720px" }}>
            {editorContext === "topic-edit"
              ? "Topic 편집"
              : "Topic 작업실"}
          </p>
        </div>

        <div className="stack" style={{ gap: "var(--space-2)", minWidth: "240px" }}>
          <span className="chip chip--accent">{formatVerificationStatus(draft.verificationStatus ?? "generated")}</span>
          <span className="caption">현재 리비전 r{draft.revision ?? 1}</span>
          <span className="caption">가져온 시각 {formatTimestamp(draft.importedAt)}</span>
          <span className="caption">마지막 검토 {formatTimestamp(draft.lastReviewedAt)}</span>
          <span className="caption">
            브라우저 편집본 {hasLocalOverride ? "있음" : "없음"}
          </span>
          <span className="caption">현재 운영자 {currentUser.displayName}</span>
          <span className="caption">
            Supabase 저장 {remotePersistenceEnabled ? "가능" : "비활성"}
          </span>
        </div>
      </div>

      {notice ? (
        <div className="surface" style={{ padding: "var(--space-4)", border: "1px solid var(--accent-border)" }}>
          <span style={{ color: "var(--text-strong)", fontSize: "0.95rem" }}>{notice}</span>
        </div>
      ) : null}

      <section className="grid-2" style={{ alignItems: "start" }}>
        <div className="stack" style={{ gap: "var(--space-6)" }}>
          <div className="surface" style={{ padding: "var(--space-6)" }}>
            <div className="section-head">
              <h2 className="section-title">운영 메타</h2>
            </div>
            <div className="stack" style={{ gap: "var(--space-4)", marginTop: "var(--space-5)" }}>
              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">검토 상태</span>
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

              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">원본 출처</span>
                <input
                  className="plain-input"
                  value={draft.sourceOrigin ?? ""}
                  onChange={(event) => updateField("sourceOrigin", event.target.value)}
                />
              </label>

              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">운영 메모</span>
                <textarea
                  className="plain-input"
                  value={draft.editorialSummary ?? ""}
                  onChange={(event) => updateField("editorialSummary", event.target.value)}
                  style={{ minHeight: "132px" }}
                />
              </label>
            </div>
          </div>

          <div className="surface" style={{ padding: "var(--space-6)" }}>
            <div className="section-head">
              <h2 className="section-title">기본 정보</h2>
            </div>
            <div className="stack" style={{ gap: "var(--space-4)", marginTop: "var(--space-5)" }}>
              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">제목</span>
                <input
                  className="plain-input"
                  value={draft.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </label>

              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">카테고리</span>
                <input
                  className="plain-input"
                  value={draft.category}
                  onChange={(event) => updateField("category", event.target.value)}
                />
              </label>

              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">요약</span>
                <textarea
                  className="plain-input"
                  value={draft.summary}
                  onChange={(event) => updateField("summary", event.target.value)}
                  style={{ minHeight: "132px" }}
                />
              </label>

              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">중요성 메모</span>
                <textarea
                  className="plain-input"
                  value={draft.importance}
                  onChange={(event) => updateField("importance", event.target.value)}
                  style={{ minHeight: "132px" }}
                />
              </label>

              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">태그 (쉼표 구분)</span>
                <input
                  className="plain-input"
                  value={draft.tags.join(", ")}
                  onChange={(event) => updateField("tags", parseCommaSeparated(event.target.value))}
                />
              </label>

              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">선수지식 Topic Slug (쉼표 구분)</span>
                <input
                  className="plain-input"
                  value={draft.prerequisites.join(", ")}
                  onChange={(event) =>
                    updateField("prerequisites", parseCommaSeparated(event.target.value))
                  }
                />
              </label>

              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">관련 Topic Slug (쉼표 구분)</span>
                <input
                  className="plain-input"
                  value={draft.related.join(", ")}
                  onChange={(event) => updateField("related", parseCommaSeparated(event.target.value))}
                />
              </label>

              <label className="stack" style={{ gap: "8px" }}>
                <span className="caption">크로스 도메인 링크 (`topicSlug | label | reason`)</span>
                <textarea
                  className="plain-input"
                  value={serializeCrossDomainLinks(draft.crossDomainLinks)}
                  onChange={(event) =>
                    updateField("crossDomainLinks", parseCrossDomainLinks(event.target.value))
                  }
                  style={{ minHeight: "144px" }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: "var(--space-6)" }}>
          {layerSequence.map((depth) => {
            const layer = draft.layers[depth];

            return (
              <section key={depth} className="surface-elevated" style={{ padding: "var(--space-6)" }}>
                <div className="section-head">
                  <h2 className="section-title">{depth.toUpperCase()} Layer</h2>
                </div>

                <div className="stack" style={{ gap: "var(--space-4)", marginTop: "var(--space-5)" }}>
                  <label className="stack" style={{ gap: "8px" }}>
                    <span className="caption">레이어 제목</span>
                    <input
                      className="plain-input"
                      value={layer.title}
                      onChange={(event) =>
                        updateLayer(depth, {
                          ...layer,
                          title: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="stack" style={{ gap: "8px" }}>
                    <span className="caption">설명</span>
                    <textarea
                      className="plain-input"
                      value={layer.description}
                      onChange={(event) =>
                        updateLayer(depth, {
                          ...layer,
                          description: event.target.value,
                        })
                      }
                      style={{ minHeight: "92px" }}
                    />
                  </label>

                  <label className="stack" style={{ gap: "8px" }}>
                    <span className="caption">본문 문단 (줄바꿈 구분)</span>
                    <textarea
                      className="plain-input"
                      value={layer.body.join("\n\n")}
                      onChange={(event) =>
                        updateLayer(depth, {
                          ...layer,
                          body: parseParagraphs(event.target.value),
                        })
                      }
                      style={{ minHeight: "220px" }}
                    />
                  </label>

                  <label className="stack" style={{ gap: "8px" }}>
                    <span className="caption">핵심 개념 (쉼표 구분)</span>
                    <input
                      className="plain-input"
                      value={layer.keyIdeas.join(", ")}
                      onChange={(event) =>
                        updateLayer(depth, {
                          ...layer,
                          keyIdeas: parseCommaSeparated(event.target.value),
                        })
                      }
                    />
                  </label>

                  <label className="stack" style={{ gap: "8px" }}>
                    <span className="caption">자가 검토 질문 (줄바꿈 구분)</span>
                    <textarea
                      className="plain-input"
                      value={(layer.questions ?? []).join("\n")}
                      onChange={(event) =>
                        updateLayer(depth, {
                          ...layer,
                          questions: parseMultiline(event.target.value),
                        })
                      }
                      style={{ minHeight: "120px" }}
                    />
                  </label>

                  <label className="stack" style={{ gap: "8px" }}>
                    <span className="caption">브리지 프롬프트</span>
                    <textarea
                      className="plain-input"
                      value={layer.bridgePrompt}
                      onChange={(event) =>
                        updateLayer(depth, {
                          ...layer,
                          bridgePrompt: event.target.value,
                        })
                      }
                      style={{ minHeight: "92px" }}
                    />
                  </label>
                </div>
              </section>
            );
          })}

          <section className="surface" style={{ padding: "var(--space-6)" }}>
            <div className="section-head">
              <h2 className="section-title">출처 확인</h2>
            </div>
            <div className="stack" style={{ gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
              {draft.sources.map((source) => (
                <article
                  key={`${draft.slug}:${source.title}`}
                  className="surface"
                  style={{
                    padding: "var(--space-4)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "6px" }}>{source.title}</strong>
                  <p className="muted" style={{ fontSize: "0.86rem", marginBottom: "4px" }}>
                    {source.publisher} · {source.type} · 신뢰도 {source.trust}
                  </p>
                  <p className="muted" style={{ fontSize: "0.86rem", marginBottom: "8px" }}>
                    {source.summary}
                  </p>
                  <a href={source.url} target="_blank" rel="noreferrer" className="caption">
                    {source.url}
                  </a>
                </article>
              ))}
            </div>
          </section>

          <div className="hero-actions" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              로컬 편집본 초기화
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              브라우저에 저장
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRemoteSave}
              disabled={!remotePersistenceEnabled || isRemoteSaving}
            >
              {isRemoteSaving ? "Supabase 저장 중..." : "Supabase에 저장"}
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}

export function EditorialWorkspaceView({
  topics: initialTopics,
  initialTopicSlug,
  currentUser,
  remotePersistenceEnabled,
  variant = "workspace",
  backHref,
  backLabel,
}: {
  topics: Topic[];
  initialTopicSlug?: string;
  currentUser: EditorialUser;
  remotePersistenceEnabled: boolean;
  variant?: "workspace" | "topic-edit";
  backHref?: string;
  backLabel?: string;
}) {
  const { getTopic, saveTopic, resetTopic, hasOverride } = useEditorial();
  const [selectedSlug, setSelectedSlug] = useState(initialTopicSlug ?? initialTopics[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const topics = initialTopics.map(getTopic);
  const filteredTopics = topics.filter((topic) => {
    if (!deferredQuery) {
      return true;
    }

    return [topic.title, topic.category, topic.summary, topic.slug, ...topic.tags]
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery);
  });
  const selectedTopic =
    topics.find((topic) => topic.slug === selectedSlug) ?? filteredTopics[0] ?? topics[0] ?? null;

  const statusCounts = verificationStatuses.map((status) => ({
    status,
    count: topics.filter((topic) => (topic.verificationStatus ?? "generated") === status).length,
  }));

  function handleSave(topic: Topic) {
    saveTopic(topic);
  }

  function handleReset(slug: string) {
    resetTopic(slug);
  }

  const isTopicEditMode = variant === "topic-edit";
  const headerTitle = isTopicEditMode
    ? `${selectedTopic?.title ?? "Topic"} 편집`
    : "학문 데이터 운영 작업실";
  const headerCopy = isTopicEditMode
    ? "Topic 편집"
    : "Topic 작업실";

  return (
    <section className="view" style={{ paddingBottom: "var(--space-24)" }}>
      <header className="stack" style={{ gap: "var(--space-6)" }}>
        <div className="stack" style={{ gap: "var(--space-4)" }}>
          <span className="caption" style={{ color: "var(--accent)" }}>
            {isTopicEditMode ? "TOPIC EDITOR" : "EDITORIAL WORKSPACE"}
          </span>
          <h1 className="hero-title">{headerTitle}</h1>
          <p className="hero-copy" style={{ maxWidth: "880px" }}>{headerCopy}</p>
        </div>

        {isTopicEditMode ? (
          <div className="stack" style={{ gap: "var(--space-4)" }}>
            <div className="metrics">
              <div className="metric">
                <strong>{selectedTopic ? `r${selectedTopic.revision ?? 1}` : "-"}</strong>
                <span>현재 리비전</span>
              </div>
              <div className="metric">
                <strong>{selectedTopic && hasOverride(selectedTopic.slug) ? "있음" : "없음"}</strong>
                <span>로컬 편집본</span>
              </div>
              <div className="metric">
                <strong>{currentUser.displayName}</strong>
                <span>현재 운영자</span>
              </div>
            </div>

            <div className="hero-actions">
              {backHref ? (
                <Link href={backHref} className="btn btn-secondary">
                  {backLabel ?? "운영 상세로 돌아가기"}
                </Link>
              ) : null}
              {selectedTopic ? (
                <Link href={`/topic/${selectedTopic.slug}`} className="btn btn-secondary">
                  사용자 화면 보기
                </Link>
              ) : null}
              <Link href="/admin/topics" className="btn btn-primary">
                Topic 목록
              </Link>
            </div>
          </div>
        ) : (
          <div className="metrics">
            <div className="metric">
              <strong>{topics.length}</strong>
              <span>적재된 Topic</span>
            </div>
            <div className="metric">
              <strong>{topics.filter((topic) => hasOverride(topic.slug)).length}</strong>
              <span>로컬 편집본</span>
            </div>
            <div className="metric">
              <strong>{currentUser.displayName}</strong>
              <span>현재 운영자</span>
            </div>
          </div>
        )}
      </header>

      <div className="feature-grid" style={{ alignItems: "start", marginTop: "var(--space-8)" }}>
        {!isTopicEditMode ? (
          <aside className="stack" style={{ gap: "var(--space-6)" }}>
            <section className="surface" style={{ padding: "var(--space-6)" }}>
              <div className="section-head">
                <h2 className="section-title">운영 현황</h2>
              </div>

              <div className="stack" style={{ gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
                {statusCounts.map((item) => (
                  <div
                    key={item.status}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span className="muted">{formatVerificationStatus(item.status)}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-elevated" style={{ padding: "var(--space-6)" }}>
              <div className="stack" style={{ gap: "var(--space-4)" }}>
                <span className="caption">TOPIC PICKER</span>
                <input
                  className="plain-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="제목, 카테고리, slug, 태그 검색"
                />
              </div>

              <div className="stack" style={{ gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
                {filteredTopics.map((topic) => {
                  const active = topic.slug === selectedTopic?.slug;

                  return (
                    <button
                      key={topic.slug}
                      type="button"
                      className="surface card-interactive"
                      onClick={() => setSelectedSlug(topic.slug)}
                      style={{
                        textAlign: "left",
                        padding: "var(--space-4)",
                        border: active ? "1px solid var(--accent-border)" : "1px solid var(--line)",
                        background: active ? "var(--bg-subtle)" : "var(--bg)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "var(--space-3)",
                          marginBottom: "10px",
                        }}
                      >
                        <strong style={{ color: "var(--text-strong)" }}>{topic.title}</strong>
                        {hasOverride(topic.slug) ? (
                          <span className="chip chip--accent">로컬 편집</span>
                        ) : null}
                      </div>
                      <div className="chip-row" style={{ marginBottom: "10px" }}>
                        <span className="chip chip--alt">{topic.category}</span>
                        <span className="chip">
                          {formatVerificationStatus(topic.verificationStatus ?? "generated")}
                        </span>
                      </div>
                      <p className="muted" style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
                        {topic.summary}
                      </p>
                    </button>
                  );
                })}

                {!filteredTopics.length ? (
                  <div className="surface" style={{ padding: "var(--space-6)", textAlign: "center" }}>
                    <p className="muted">검색 결과가 없습니다.</p>
                  </div>
                ) : null}
              </div>
            </section>
          </aside>
        ) : null}

        <main>
          {selectedTopic ? (
            <TopicEditorForm
              key={selectedTopic.slug}
              topic={selectedTopic}
              hasLocalOverride={hasOverride(selectedTopic.slug)}
              currentUser={currentUser}
              remotePersistenceEnabled={remotePersistenceEnabled}
              editorContext={variant}
              onSave={handleSave}
              onReset={handleReset}
            />
          ) : (
            <div className="surface" style={{ padding: "var(--space-10)", textAlign: "center" }}>
              <p className="muted">편집할 Topic을 선택하십시오.</p>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
