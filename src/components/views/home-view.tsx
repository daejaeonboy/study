"use client";

import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { useAppUser } from "@/components/providers/app-user-provider";
import { KnowledgeGraphCanvas } from "@/components/knowledge-graph-canvas";
import type { GuideRecommendation } from "@/lib/domain";
import { disciplineBranches, getDisciplineProfile } from "@/lib/disciplines";
import {
  buildGraphDocument,
  createDisciplineSelection,
  createStageSelection,
  createTopicSelection,
  getGraphTabId,
  getGraphTabLabel,
  type GraphDocument,
  type GraphSelection,
} from "@/lib/graph-documents";

const DEFAULT_SELECTION = createDisciplineSelection("천문학");
const SIDEBAR_DEFAULT_WIDTH = 276;
const SIDEBAR_MIN_WIDTH = 224;
const SIDEBAR_MAX_WIDTH = 420;
const GUIDE_DEPTH_LABEL: Record<GuideRecommendation["recommendedDepth"], string> = {
  light: "가볍게 시작",
  core: "핵심 중심",
  deep: "깊이 탐구",
};
const GUIDE_LABEL_BY_TOPIC_SLUG: Record<string, string> = {
  "black-hole": "블랙홀",
  gravity: "중력",
  spacetime: "시공간",
  "general-relativity": "일반상대성이론",
  set: "집합",
  proposition: "명제",
  logic: "논리",
  function: "함수",
  "proof-methods": "증명 방식",
  "reading-definitions": "정의를 읽는 법",
  epistemology: "인식론",
  skepticism: "회의주의",
  metaphysics: "형이상학",
  "philosophy-of-mind": "마음의 철학",
  ethics: "윤리학",
  "political-philosophy": "정치철학",
  "philosophy-of-science": "과학철학",
  "scientific-revolution": "과학혁명",
  "french-revolution": "프랑스 혁명",
  democracy: "민주주의",
};
const GUIDE_DISCIPLINE_BY_TOPIC_SLUG: Record<string, string> = {
  "black-hole": "천문학",
  gravity: "물리학",
  spacetime: "물리학",
  "general-relativity": "물리학",
  set: "수학",
  proposition: "수학",
  logic: "수학",
  function: "수학",
  "proof-methods": "수학",
  "reading-definitions": "수학",
  epistemology: "철학",
  skepticism: "철학",
  metaphysics: "철학",
  "philosophy-of-mind": "철학",
  ethics: "철학",
  "political-philosophy": "철학",
  "philosophy-of-science": "철학",
  "scientific-revolution": "역사학",
  "french-revolution": "역사학",
  democracy: "철학",
};

type WorkspaceTab =
  | {
      id: "graph";
      kind: "graph";
      label: string;
    }
  | {
      id: string;
      kind: "document";
      label: string;
      selection: GraphSelection;
    };

const GRAPH_TAB: WorkspaceTab = {
  id: "graph",
  kind: "graph",
  label: "그래프 뷰",
};

function isDocumentTab(tab: WorkspaceTab): tab is Extract<WorkspaceTab, { kind: "document" }> {
  return tab.kind === "document";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isSameSelection(left: GraphSelection, right: GraphSelection) {
  return (
    left.kind === right.kind &&
    left.discipline === right.discipline &&
    left.stage === right.stage &&
    left.topic === right.topic
  );
}

function getDisciplineStages(discipline: string) {
  return getDisciplineProfile(discipline).stages ?? [];
}

function hasDisciplineStages(discipline: string) {
  return getDisciplineStages(discipline).length > 0;
}

function createStageKey(discipline: string, stageLevel: string) {
  return `${discipline}::${stageLevel}`;
}

function toggleExpandedId(current: string[], id: string) {
  return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
}

function getBranchIdForDiscipline(discipline: string) {
  return disciplineBranches.find((branch) => branch.disciplines.includes(discipline))?.id ?? null;
}

function matchesStageSelection(
  selection: GraphSelection,
  discipline: string,
  stageLevel: string,
  topic?: string,
) {
  if (selection.discipline !== discipline) {
    return false;
  }

  if (topic) {
    return selection.kind === "topic" && selection.stage === stageLevel && selection.topic === topic;
  }

  if (selection.kind === "topic") {
    return selection.stage === stageLevel;
  }

  return selection.kind === "stage" && selection.stage === stageLevel;
}

function matchesStageQuery(query: string, stage: { level: string; title: string; topics: string[] }) {
  if (!query) {
    return true;
  }

  return [stage.level, stage.title, ...stage.topics].some((value) =>
    value.toLowerCase().includes(query),
  );
}

function getGuideTopicLabel(slug: string) {
  return GUIDE_LABEL_BY_TOPIC_SLUG[slug] ?? slug;
}

function DocumentPanel({
  document,
  onOpenSelection,
}: {
  document: GraphDocument;
  onOpenSelection: (selection: GraphSelection) => void;
}) {
  return (
    <article className="knowledge-document">
      <header className="knowledge-document__header">
        <p className="knowledge-document__eyebrow">{document.eyebrow}</p>
        <h1 className="knowledge-document__title">{document.title}</h1>
        <p className="knowledge-document__summary">{document.summary}</p>

        <div className="knowledge-document__meta">
          {document.meta.map((item) => (
            <span key={item} className="knowledge-document__meta-chip">
              {item}
            </span>
          ))}
        </div>
      </header>

      <div className="knowledge-document__body">
        {document.sections.map((section) => (
          <section key={section.title} className="knowledge-document__section">
            <h2>{section.title}</h2>
            {section.body.map((paragraph, index) => (
              <p key={`${section.title}:${index}`}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>

      {document.related.length ? (
        <footer className="knowledge-document__footer">
          <span className="knowledge-document__footer-label">이어 읽기</span>
          <div className="knowledge-document__links">
            {document.related.map((item) => (
              <button
                key={`${document.id}:${item.label}`}
                type="button"
                className="knowledge-document__link"
                onClick={() => onOpenSelection(item.selection)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </footer>
      ) : null}
    </article>
  );
}

export function HomeView() {
  const appUser = useAppUser();
  const [tabs, setTabs] = useState<WorkspaceTab[]>([GRAPH_TAB]);
  const [activeTabId, setActiveTabId] = useState<string>(GRAPH_TAB.id);
  const [focusedSelection, setFocusedSelection] = useState<GraphSelection>(DEFAULT_SELECTION);
  const [isCurriculumExpanded, setIsCurriculumExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedBranchIds, setExpandedBranchIds] = useState<string[]>([]);
  const [expandedDisciplineIds, setExpandedDisciplineIds] = useState<string[]>([]);
  const [expandedStageIds, setExpandedStageIds] = useState<string[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [query, setQuery] = useState("");
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantRecommendation, setAssistantRecommendation] = useState<GuideRecommendation | null>(
    null,
  );
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [isAssistantPending, setIsAssistantPending] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const [resizeState, setResizeState] = useState({
    startX: 0,
    startWidth: SIDEBAR_DEFAULT_WIDTH,
  });

  useEffect(() => {
    if (!isResizingSidebar || isSidebarCollapsed) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const deltaX = event.clientX - resizeState.startX;
      setSidebarWidth(clamp(resizeState.startWidth + deltaX, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH));
    }

    function stopResizing() {
      setIsResizingSidebar(false);
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
  }, [isResizingSidebar, isSidebarCollapsed, resizeState]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? GRAPH_TAB;
  const activeDocument = activeTab.kind === "document" ? buildGraphDocument(activeTab.selection) : null;
  const assistantDiscipline = assistantRecommendation
    ? GUIDE_DISCIPLINE_BY_TOPIC_SLUG[assistantRecommendation.startTopicSlug] ?? null
    : null;
  const isAssistantOpen =
    isAssistantPending || Boolean(assistantError) || Boolean(assistantRecommendation);

  function focusSelection(selection: GraphSelection) {
    if (isSameSelection(selection, focusedSelection)) {
      if (selection.kind === "topic") {
        setFocusedSelection(createStageSelection(selection.discipline, selection.stage));
        setIsCurriculumExpanded(hasDisciplineStages(selection.discipline));
        return;
      }

      if (selection.kind === "stage") {
        setFocusedSelection(createDisciplineSelection(selection.discipline));
        setIsCurriculumExpanded(hasDisciplineStages(selection.discipline));
        return;
      }

      if (selection.kind === "discipline" && hasDisciplineStages(selection.discipline)) {
        setIsCurriculumExpanded((current) => !current);
        return;
      }
    }

    ensureSelectionExpanded(selection);
    setFocusedSelection(selection);
    setIsCurriculumExpanded(hasDisciplineStages(selection.discipline));
  }

  function showSelectionInGraph(selection: GraphSelection) {
    ensureSelectionExpanded(selection);
    setFocusedSelection(selection);
    setIsCurriculumExpanded(hasDisciplineStages(selection.discipline));
    setActiveTabId(GRAPH_TAB.id);
  }

  function openSelection(selection: GraphSelection) {
    const nextTab: WorkspaceTab = {
      id: getGraphTabId(selection),
      kind: "document",
      label: getGraphTabLabel(selection),
      selection,
    };

    ensureSelectionExpanded(selection);
    setFocusedSelection(selection);
    setIsCurriculumExpanded(hasDisciplineStages(selection.discipline));
    setTabs((current) => (current.some((tab) => tab.id === nextTab.id) ? current : [...current, nextTab]));
    setActiveTabId(nextTab.id);
  }

  function closeTab(tabId: string) {
    setTabs((current) => {
      const nextTabs = current.filter((tab) => tab.id !== tabId);

      if (activeTabId === tabId) {
        setActiveTabId(nextTabs[nextTabs.length - 1]?.id ?? GRAPH_TAB.id);
      }

      return nextTabs;
    });
  }

  function closeAssistantSidebar() {
    setAssistantError(null);
    setAssistantRecommendation(null);
    setIsAssistantPending(false);
  }

  function handleSidebarResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    setResizeState({
      startX: event.clientX,
      startWidth: sidebarWidth,
    });
    setIsResizingSidebar(true);
  }

  function toggleBranch(branchId: string) {
    setExpandedBranchIds((current) => toggleExpandedId(current, branchId));
  }

  function toggleDiscipline(discipline: string) {
    setExpandedDisciplineIds((current) => toggleExpandedId(current, discipline));
  }

  function toggleStage(discipline: string, stageLevel: string) {
    setExpandedStageIds((current) => toggleExpandedId(current, createStageKey(discipline, stageLevel)));
  }

  function ensureSelectionExpanded(selection: GraphSelection) {
    const branchId = getBranchIdForDiscipline(selection.discipline);

    if (branchId) {
      setExpandedBranchIds((current) =>
        current.includes(branchId) ? current : [...current, branchId],
      );
    }

    if (hasDisciplineStages(selection.discipline)) {
      setExpandedDisciplineIds((current) =>
        current.includes(selection.discipline) ? current : [...current, selection.discipline],
      );
    }

    if (selection.kind === "stage" || selection.kind === "topic") {
      const stageKey = createStageKey(selection.discipline, selection.stage);
      setExpandedStageIds((current) => (current.includes(stageKey) ? current : [...current, stageKey]));
    }
  }

  async function handleAssistantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = assistantQuery.trim();
    if (!nextQuery) {
      return;
    }

    setAssistantPrompt(nextQuery);
    setAssistantError(null);
    setIsAssistantPending(true);

    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: nextQuery }),
      });

      if (!response.ok) {
        throw new Error("AI 응답을 불러오지 못했습니다.");
      }

      const data = (await response.json()) as GuideRecommendation;
      setAssistantRecommendation(data);
    } catch {
      setAssistantRecommendation(null);
      setAssistantError("AI 응답을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAssistantPending(false);
    }
  }

  const autoExpandedBranchIds = new Set<string>();
  const autoExpandedDisciplineIds = new Set<string>();
  const autoExpandedStageIds = new Set<string>();

  const branches = disciplineBranches
    .map((branch) => {
      const branchMatches = normalizedQuery ? branch.label.toLowerCase().includes(normalizedQuery) : false;
      const disciplines = branch.disciplines
        .map((discipline) => {
          const allStages = getDisciplineStages(discipline);
          const disciplineMatches = normalizedQuery
            ? discipline.toLowerCase().includes(normalizedQuery)
            : false;
          const visibleStages = allStages
            .filter((stage) => {
              if (!normalizedQuery) {
                return true;
              }

              if (disciplineMatches) {
                return true;
              }

              return matchesStageQuery(normalizedQuery, stage);
            })
            .map((stage) => {
              const stageMatches = normalizedQuery ? matchesStageQuery(normalizedQuery, stage) : false;
              const visibleTopics =
                normalizedQuery && !disciplineMatches
                  ? stage.topics.filter((topic) => topic.toLowerCase().includes(normalizedQuery))
                  : stage.topics;

              if (normalizedQuery && stageMatches) {
                autoExpandedStageIds.add(createStageKey(discipline, stage.level));
              }

              return {
                ...stage,
                visibleTopics,
              };
            });

          const isVisible = !normalizedQuery || disciplineMatches || visibleStages.length > 0;

          if (normalizedQuery && isVisible) {
            autoExpandedBranchIds.add(branch.id);
          }

          if (normalizedQuery && (disciplineMatches || visibleStages.length > 0)) {
            autoExpandedDisciplineIds.add(discipline);
          }

          return {
            id: discipline,
            label: discipline,
            disciplineMatches,
            stages: visibleStages,
            hasStages: allStages.length > 0,
            isVisible,
          };
        })
        .filter((discipline) => discipline.isVisible);

      return {
        ...branch,
        branchMatches,
        disciplines,
      };
    })
    .filter((branch) => (!normalizedQuery ? true : branch.branchMatches || branch.disciplines.length > 0));

  const visibleExpandedBranchIds = new Set([...expandedBranchIds, ...autoExpandedBranchIds]);
  const visibleExpandedDisciplineIds = new Set([
    ...expandedDisciplineIds,
    ...autoExpandedDisciplineIds,
  ]);
  const visibleExpandedStageIds = new Set([...expandedStageIds, ...autoExpandedStageIds]);

  const selectedStage =
    focusedSelection.kind === "stage" || focusedSelection.kind === "topic"
      ? focusedSelection.stage
      : null;
  const selectedTopic = focusedSelection.kind === "topic" ? focusedSelection.topic : null;

  return (
    <section
      className={`knowledge-workspace ${isSidebarCollapsed ? "is-sidebar-collapsed" : ""}`}
    >
      <div
        className={`knowledge-sidebar-shell ${isSidebarCollapsed ? "is-collapsed" : ""}`}
        style={{ width: isSidebarCollapsed ? "0px" : `${sidebarWidth}px` }}
      >
        <aside className={`knowledge-sidebar ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
          <header className="knowledge-sidebar__header">
            <div className="knowledge-sidebar__topbar">
              <div>
                <p className="knowledge-sidebar__eyebrow">ACADEMIC VAULT</p>
                <h1 className="knowledge-sidebar__title">학문 그래프</h1>
              </div>
              <button
                type="button"
                className="knowledge-sidebar__toggle"
                onClick={() => setIsSidebarCollapsed(true)}
                aria-label="왼쪽 사이드바 접기"
              >
                ←
              </button>
            </div>
            <p className="knowledge-sidebar__description">
              그래프에서 노드를 선택하면 하위 구조를 보고, 읽기 버튼으로 본문 탭을 열 수 있습니다.
            </p>
          </header>

          <div className="knowledge-sidebar__search">
            <input
              type="search"
              className="knowledge-sidebar__search-input"
              placeholder="학문 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <section className="knowledge-sidebar__section">
            <h2>학문 목록</h2>
            <div className="knowledge-sidebar__tree">
              {branches.map((branch) => (
                <div key={branch.id} className="knowledge-sidebar__branch">
                  <button
                    type="button"
                    className={`knowledge-sidebar__branch-toggle ${
                      visibleExpandedBranchIds.has(branch.id) ? "is-expanded" : ""
                    }`}
                    onClick={() => toggleBranch(branch.id)}
                    aria-expanded={visibleExpandedBranchIds.has(branch.id)}
                  >
                    {branch.label}
                  </button>
                  {visibleExpandedBranchIds.has(branch.id) ? (
                    <div className="knowledge-sidebar__branch-items">
                      {branch.disciplines.map((discipline) => {
                        const isDisciplineSelected = focusedSelection.discipline === discipline.id;
                        const isDisciplineExpanded =
                          discipline.hasStages && visibleExpandedDisciplineIds.has(discipline.id);

                        return (
                          <div key={discipline.id} className="knowledge-sidebar__leaf-group">
                            {discipline.hasStages ? (
                              <div className="knowledge-sidebar__node-row">
                                <button
                                  type="button"
                                  className={`knowledge-sidebar__leaf ${
                                    isDisciplineSelected ? "is-selected" : ""
                                  }`}
                                  onClick={() =>
                                    openSelection(createDisciplineSelection(discipline.id))
                                  }
                                >
                                  {discipline.label}
                                </button>
                                <button
                                  type="button"
                                  className={`knowledge-sidebar__inline-toggle ${
                                    isDisciplineExpanded ? "is-expanded" : ""
                                  }`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleDiscipline(discipline.id);
                                  }}
                                  aria-label={`${discipline.label} 단계 ${
                                    isDisciplineExpanded ? "접기" : "펼치기"
                                  }`}
                                  aria-expanded={isDisciplineExpanded}
                                />
                              </div>
                            ) : (
                              <button
                                type="button"
                                className={`knowledge-sidebar__leaf ${
                                  isDisciplineSelected ? "is-selected" : ""
                                }`}
                                onClick={() => openSelection(createDisciplineSelection(discipline.id))}
                              >
                                {discipline.label}
                              </button>
                            )}

                            {discipline.hasStages && isDisciplineExpanded ? (
                              <div className="knowledge-sidebar__subtree">
                                {discipline.stages.map((stage) => {
                                  const stageKey = createStageKey(discipline.id, stage.level);
                                  const isStageExpanded = visibleExpandedStageIds.has(stageKey);

                                  return (
                                    <div key={stage.level} className="knowledge-sidebar__stage-group">
                                      <div className="knowledge-sidebar__node-row knowledge-sidebar__node-row--stage">
                                        <button
                                          type="button"
                                          className={`knowledge-sidebar__stage-button ${
                                            matchesStageSelection(
                                              focusedSelection,
                                              discipline.id,
                                              stage.level,
                                            )
                                              ? "is-selected"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            openSelection(
                                              createStageSelection(discipline.id, stage.level),
                                            )
                                          }
                                        >
                                          {stage.level} · {stage.title}
                                        </button>
                                        <button
                                          type="button"
                                          className={`knowledge-sidebar__inline-toggle ${
                                            isStageExpanded ? "is-expanded" : ""
                                          }`}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            toggleStage(discipline.id, stage.level);
                                          }}
                                          aria-label={`${stage.level} 단계 ${
                                            isStageExpanded ? "접기" : "펼치기"
                                          }`}
                                          aria-expanded={isStageExpanded}
                                        />
                                      </div>

                                      {isStageExpanded ? (
                                        <div className="knowledge-sidebar__topic-list">
                                          {stage.visibleTopics.map((topic) => (
                                            <button
                                              key={`${stage.level}:${topic}`}
                                              type="button"
                                              className={`knowledge-sidebar__topic-button ${
                                                matchesStageSelection(
                                                  focusedSelection,
                                                  discipline.id,
                                                  stage.level,
                                                  topic,
                                                )
                                                  ? "is-selected"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                openSelection(
                                                  createTopicSelection(
                                                    discipline.id,
                                                    stage.level,
                                                    topic,
                                                  ),
                                                )
                                              }
                                            >
                                              {topic}
                                            </button>
                                          ))}
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </aside>

        {!isSidebarCollapsed ? (
          <div
            className="knowledge-sidebar__resizer"
            role="separator"
            aria-orientation="vertical"
            aria-label="왼쪽 사이드바 너비 조절"
            onPointerDown={handleSidebarResizeStart}
          />
        ) : null}
      </div>

      <div className={`knowledge-main-shell ${isAssistantOpen ? "has-ai-sidebar" : ""}`}>
        <div className="knowledge-main">
          {isSidebarCollapsed ? (
            <button
              type="button"
              className="knowledge-main__sidebar-toggle"
              onClick={() => setIsSidebarCollapsed(false)}
              aria-label="왼쪽 사이드바 열기"
            >
              목록
            </button>
          ) : null}

          <div className="knowledge-tabbar">
            <div className="knowledge-tabbar__scroll">
              <button
                type="button"
                className={`knowledge-tab ${activeTabId === GRAPH_TAB.id ? "is-active" : ""}`}
                onClick={() => setActiveTabId(GRAPH_TAB.id)}
              >
                <span>{GRAPH_TAB.label}</span>
              </button>

              {tabs
                .filter(isDocumentTab)
                .map((tab) => (
                  <div
                    key={tab.id}
                    className={`knowledge-tab ${activeTabId === tab.id ? "is-active" : ""}`}
                  >
                    <button
                      type="button"
                      className="knowledge-tab__button"
                      onClick={() => {
                        setActiveTabId(tab.id);
                        setFocusedSelection(tab.selection);
                        setIsCurriculumExpanded(hasDisciplineStages(tab.selection.discipline));
                      }}
                    >
                      {tab.label}
                    </button>
                    <button
                      type="button"
                      className="knowledge-tab__close"
                      onClick={() => closeTab(tab.id)}
                      aria-label={`${tab.label} 탭 닫기`}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>

            <div className="knowledge-tabbar__actions">
              <Link
                href={appUser ? "/library" : "/auth?next=/"}
                className={`knowledge-tabbar__user-btn ${appUser ? "is-authenticated" : ""}`}
              >
                {appUser ? (
                  <>
                    <span className="knowledge-tabbar__user-name">{appUser.displayName}</span>
                    <span className="knowledge-tabbar__user-badge">내 서고</span>
                  </>
                ) : (
                  "로그인"
                )}
              </Link>
            </div>
          </div>

          <div
            className={`knowledge-main__body ${
              activeTab.kind === "document" ? "knowledge-main__body--document" : ""
            }`}
          >
            {activeTab.kind === "graph" ? (
              <section className="knowledge-canvas">
                <div className="knowledge-canvas__stage">
                  <KnowledgeGraphCanvas
                    selectedDiscipline={focusedSelection.discipline}
                    selectedStage={selectedStage}
                    selectedTopic={selectedTopic}
                    isCurriculumExpanded={isCurriculumExpanded}
                    onSelectNode={focusSelection}
                    onReadNode={openSelection}
                  />
                </div>
              </section>
            ) : activeDocument ? (
              <div className="knowledge-document-scroll">
                <DocumentPanel document={activeDocument} onOpenSelection={openSelection} />
              </div>
            ) : null}
          </div>

          <form className="knowledge-assistant" onSubmit={handleAssistantSubmit}>
            <input
              type="text"
              className="knowledge-assistant__input"
              value={assistantQuery}
              onChange={(event) => setAssistantQuery(event.target.value)}
              placeholder="AI에게 학습 방향을 물어보세요"
              aria-label="AI에게 질문하기"
            />
            <button
              type="submit"
              className="knowledge-assistant__submit"
              disabled={isAssistantPending || !assistantQuery.trim()}
            >
              {isAssistantPending ? "답변 중..." : "질문"}
            </button>
          </form>
        </div>

        {isAssistantOpen ? (
          <aside className="knowledge-ai-sidebar" aria-label="AI 응답 패널">
            <header className="knowledge-ai-sidebar__header">
              <div>
                <p className="knowledge-ai-sidebar__eyebrow">AI GUIDE</p>
                <h2 className="knowledge-ai-sidebar__title">탐색 답변</h2>
              </div>
              <button
                type="button"
                className="knowledge-ai-sidebar__close"
                onClick={closeAssistantSidebar}
                aria-label="AI 응답 패널 닫기"
              >
                ×
              </button>
            </header>

            {assistantPrompt ? (
              <p className="knowledge-ai-sidebar__prompt">{assistantPrompt}</p>
            ) : null}

            {isAssistantPending ? (
              <div className="knowledge-ai-sidebar__state">
                <p>질문을 바탕으로 시작점과 연결 경로를 정리하고 있습니다.</p>
              </div>
            ) : assistantError ? (
              <div className="knowledge-ai-sidebar__state is-error">
                <p>{assistantError}</p>
              </div>
            ) : assistantRecommendation ? (
              <div className="knowledge-ai-sidebar__content">
                <div className="knowledge-ai-sidebar__summary">
                  <span className="knowledge-ai-sidebar__chip">
                    {GUIDE_DEPTH_LABEL[assistantRecommendation.recommendedDepth]}
                  </span>
                  <h3>{assistantRecommendation.title}</h3>
                  <p>{assistantRecommendation.summary}</p>
                </div>

                <section className="knowledge-ai-sidebar__section">
                  <h4>왜 이렇게 추천했는가</h4>
                  <ul className="knowledge-ai-sidebar__list">
                    {assistantRecommendation.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </section>

                <section className="knowledge-ai-sidebar__section">
                  <h4>추천 흐름</h4>
                  <div className="knowledge-ai-sidebar__chips">
                    {assistantRecommendation.path.map((slug) => (
                      <span key={slug} className="knowledge-ai-sidebar__chip is-soft">
                        {getGuideTopicLabel(slug)}
                      </span>
                    ))}
                  </div>
                </section>

                {assistantRecommendation.bridges.length ? (
                  <section className="knowledge-ai-sidebar__section">
                    <h4>브리지 주제</h4>
                    <div className="knowledge-ai-sidebar__chips">
                      {assistantRecommendation.bridges.map((slug) => (
                        <span key={slug} className="knowledge-ai-sidebar__chip is-soft">
                          {getGuideTopicLabel(slug)}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                {assistantDiscipline ? (
                  <div className="knowledge-ai-sidebar__actions">
                    <button
                      type="button"
                      className="knowledge-ai-sidebar__action"
                      onClick={() => openSelection(createDisciplineSelection(assistantDiscipline))}
                    >
                      추천 학문 읽기
                    </button>
                    <button
                      type="button"
                      className="knowledge-ai-sidebar__action is-ghost"
                      onClick={() =>
                        showSelectionInGraph(createDisciplineSelection(assistantDiscipline))
                      }
                    >
                      그래프에서 보기
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
