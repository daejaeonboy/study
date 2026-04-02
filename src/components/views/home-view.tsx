"use client";

import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useState,
  useRef,
  type FormEvent,
  type CSSProperties,
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
const ASSISTANT_SIDEBAR_DEFAULT_WIDTH = 380;
const ASSISTANT_SIDEBAR_MIN_WIDTH = 300;
const ASSISTANT_SIDEBAR_MAX_WIDTH = 560;
const AI_SETTINGS_STORAGE_KEY = "ikl.aiSettings";
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

type WorkspaceTab =
  | {
      id: "graph";
      kind: "graph";
      label: string;
    }
  | {
      id: "settings";
      kind: "settings";
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

const SETTINGS_TAB: WorkspaceTab = {
  id: "settings",
  kind: "settings",
  label: "설정",
};

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  tone?: "default" | "pending" | "error";
};

type AiIntegrationSettings = {
  enabled: boolean;
  provider: "openai" | "gemini" | "grok" | "custom";
  apiUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
};

type AiModelOption = {
  value: string;
  label: string;
};

const OPENAI_MODEL_OPTIONS: AiModelOption[] = [
  { value: "gpt-5.4", label: "GPT-5.4" },
  { value: "gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { value: "gpt-5.4-nano", label: "GPT-5.4 Nano" },
  { value: "gpt-5.1", label: "GPT-5.1" },
  { value: "gpt-5-mini", label: "GPT-5 Mini" },
  { value: "gpt-5-nano", label: "GPT-5 Nano" },
  { value: "gpt-5", label: "GPT-5" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
];

const GEMINI_MODEL_OPTIONS: AiModelOption[] = [
  { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview" },
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { value: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash-Lite Preview" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
];

const GROK_MODEL_OPTIONS: AiModelOption[] = [
  { value: "grok-4.20-reasoning", label: "Grok 4.20 Reasoning" },
  { value: "grok-4.20-beta-latest-non-reasoning", label: "Grok 4.20 Beta Latest Non-Reasoning" },
  { value: "grok-4", label: "Grok 4 (stable alias)" },
  { value: "grok-4-1-fast-reasoning", label: "Grok 4.1 Fast Reasoning" },
  { value: "grok-4-fast-non-reasoning", label: "Grok 4 Fast" },
  { value: "grok-4-fast-reasoning", label: "Grok 4 Fast Reasoning" },
  { value: "grok-code-fast-1", label: "Grok Code Fast 1" },
];

const AI_MODEL_OPTIONS: Record<AiIntegrationSettings["provider"], AiModelOption[]> = {
  openai: OPENAI_MODEL_OPTIONS,
  gemini: GEMINI_MODEL_OPTIONS,
  grok: GROK_MODEL_OPTIONS,
  custom: [...OPENAI_MODEL_OPTIONS, ...GEMINI_MODEL_OPTIONS, ...GROK_MODEL_OPTIONS],
};

type ExternalAssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_AI_SETTINGS: AiIntegrationSettings = {
  enabled: false,
  provider: "openai",
  apiUrl: "https://api.openai.com/v1/chat/completions",
  apiKey: "",
  model: "gpt-5.4",
  systemPrompt:
    "당신은 친절한 학술 학습 도우미입니다. 한국어로 명확하고 직접적인 답변을 제공하세요.",
};

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

function formatAssistantReply(recommendation: GuideRecommendation) {
  const path = recommendation.path.map(getGuideTopicLabel).join(" -> ");
  const bridges = recommendation.bridges.map(getGuideTopicLabel).join(", ");

  return [
    recommendation.title,
    recommendation.summary,
    recommendation.reasons.length
      ? `이유: ${recommendation.reasons.join(" ")}`
      : "",
    path ? `추천 흐름: ${path}` : "",
    bridges ? `브리지 주제: ${bridges}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function getAiModelOptions(provider: AiIntegrationSettings["provider"]) {
  return AI_MODEL_OPTIONS[provider];
}

function getDefaultModelForProvider(provider: AiIntegrationSettings["provider"]) {
  return getAiModelOptions(provider)[0]?.value ?? DEFAULT_AI_SETTINGS.model;
}

function isSupportedAiModel(provider: AiIntegrationSettings["provider"], model: string) {
  return getAiModelOptions(provider).some((option) => option.value === model);
}

function normalizeAiSettings(raw: string | null): AiIntegrationSettings {
  if (!raw) {
    return DEFAULT_AI_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AiIntegrationSettings>;
    const provider =
      parsed.provider === "openai" ||
      parsed.provider === "gemini" ||
      parsed.provider === "grok" ||
      parsed.provider === "custom"
        ? parsed.provider
        : DEFAULT_AI_SETTINGS.provider;
    const model =
      typeof parsed.model === "string" && parsed.model.trim()
        ? parsed.model.trim()
        : getDefaultModelForProvider(provider);

    return {
      enabled: Boolean(parsed.enabled),
      provider,
      apiUrl:
        typeof parsed.apiUrl === "string" && parsed.apiUrl.trim()
          ? parsed.apiUrl
          : DEFAULT_AI_SETTINGS.apiUrl,
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      model: isSupportedAiModel(provider, model) ? model : getDefaultModelForProvider(provider),
      systemPrompt:
        typeof parsed.systemPrompt === "string"
          ? parsed.systemPrompt
          : DEFAULT_AI_SETTINGS.systemPrompt,
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

function DocumentPanel({
  document,
  onOpenSelection,
  onAskQuestion,
}: {
  document: GraphDocument;
  onOpenSelection: (selection: GraphSelection) => void;
  onAskQuestion: (question: string, document: GraphDocument) => void;
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
            {section.kind === "questions" ? (
              <div className="knowledge-document__question-list">
                {section.body.map((question, index) => (
                  <button
                    key={`${section.title}:${index}`}
                    type="button"
                    className="knowledge-document__question"
                    onClick={() => onAskQuestion(question, document)}
                    aria-label={`AI에게 질문하기: ${question}`}
                  >
                    <span className="knowledge-document__question-index">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="knowledge-document__question-text">{question}</span>
                  </button>
                ))}
              </div>
            ) : (
              section.body.map((paragraph, index) => (
                <p key={`${section.title}:${index}`}>{paragraph}</p>
              ))
            )}
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
  const [assistantSidebarWidth, setAssistantSidebarWidth] = useState(
    ASSISTANT_SIDEBAR_DEFAULT_WIDTH,
  );
  const [isResizingAssistantSidebar, setIsResizingAssistantSidebar] = useState(false);
  const [isAssistantSidebarCollapsed, setIsAssistantSidebarCollapsed] = useState(false);
  const [aiSettings, setAiSettings] = useState<AiIntegrationSettings>(DEFAULT_AI_SETTINGS);
  const [query, setQuery] = useState("");
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [isAssistantPending, setIsAssistantPending] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnectionResult, setTestConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const [resizeState, setResizeState] = useState({
    startX: 0,
    startWidth: SIDEBAR_DEFAULT_WIDTH,
  });
  const [assistantResizeState, setAssistantResizeState] = useState({
    startX: 0,
    startWidth: ASSISTANT_SIDEBAR_DEFAULT_WIDTH,
  });
  const assistantMessagesRef = useRef<HTMLDivElement | null>(null);
  const hasCustomAiConnection =
    aiSettings.enabled &&
    Boolean(aiSettings.apiUrl.trim() && aiSettings.apiKey.trim() && aiSettings.model.trim());

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

  useEffect(() => {
    if (!isResizingAssistantSidebar || isAssistantSidebarCollapsed) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const deltaX = assistantResizeState.startX - event.clientX;
      setAssistantSidebarWidth(
        clamp(
          assistantResizeState.startWidth + deltaX,
          ASSISTANT_SIDEBAR_MIN_WIDTH,
          ASSISTANT_SIDEBAR_MAX_WIDTH,
        ),
      );
    }

    function stopResizing() {
      setIsResizingAssistantSidebar(false);
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
  }, [assistantResizeState, isAssistantSidebarCollapsed, isResizingAssistantSidebar]);

  useEffect(() => {
    const container = assistantMessagesRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [assistantMessages, isAssistantPending]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setAiSettings(normalizeAiSettings(window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(aiSettings));
  }, [aiSettings]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? GRAPH_TAB;
  const activeDocument = activeTab.kind === "document" ? buildGraphDocument(activeTab.selection) : null;
  const assistantShellStyle = {
    "--assistant-sidebar-width": `${assistantSidebarWidth}px`,
  } as CSSProperties;

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

  function handleOpenSettings() {
    setTabs((current) =>
      current.some((tab) => tab.id === SETTINGS_TAB.id) ? current : [...current, SETTINGS_TAB],
    );
    setActiveTabId(SETTINGS_TAB.id);
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

  async function submitAssistantQuery(prompt: string, query = prompt) {
    const nextPrompt = prompt.trim();
    const nextQuery = query.trim();

    if (!nextPrompt || !nextQuery || isAssistantPending) {
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now() + 1}`;

    setAssistantMessages((current) => [
      ...current,
      {
        id: userMessageId,
        role: "user",
        content: nextPrompt,
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "질문을 읽고 답변을 정리하고 있습니다.",
        tone: "pending",
      },
    ]);
    setAssistantQuery("");
    setIsAssistantPending(true);

    try {
      let content = "";

      if (hasCustomAiConnection) {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...assistantMessages
                .filter((message) => message.tone !== "pending")
                .map(
                  (message): ExternalAssistantMessage => ({
                    role: message.role,
                    content: message.content,
                  }),
                ),
              {
                role: "user",
                content: nextQuery,
              },
            ],
            config: aiSettings,
          }),
        });
        const data = (await response.json().catch(() => null)) as { content?: string; error?: string } | null;

        if (!response.ok || typeof data?.content !== "string") {
          throw new Error(data?.error ?? "외부 AI 응답을 불러오지 못했습니다.");
        }

        content = data.content;
      } else {
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
        content = formatAssistantReply(data);
      }

      setAssistantMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content,
                tone: "default",
              }
            : message,
        ),
      );
    } catch (error) {
      setAssistantMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content:
                  error instanceof Error
                    ? error.message
                    : "AI 응답을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
                tone: "error",
              }
            : message,
        ),
      );
    } finally {
      setIsAssistantPending(false);
    }
  }

  function handleSidebarResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    setResizeState({
      startX: event.clientX,
      startWidth: sidebarWidth,
    });
    setIsResizingSidebar(true);
  }

  function handleAssistantSidebarResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    setAssistantResizeState({
      startX: event.clientX,
      startWidth: assistantSidebarWidth,
    });
    setIsResizingAssistantSidebar(true);
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
    await submitAssistantQuery(assistantQuery);
  }

  function handleDocumentQuestion(question: string, document: GraphDocument) {
    const contextualQuery = `${document.eyebrow} ${document.title} ${question}`;
    void submitAssistantQuery(question, contextualQuery);
  }

  function updateAiSettings<K extends keyof AiIntegrationSettings>(
    key: K,
    value: AiIntegrationSettings[K],
  ) {
    setAiSettings((current) => {
      const next = { ...current, [key]: value };

      if (key === "provider") {
        const nextProvider = value as AiIntegrationSettings["provider"];

        if (nextProvider === "openai") {
          next.apiUrl = "https://api.openai.com/v1/chat/completions";
        } else if (nextProvider === "gemini") {
          next.apiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        } else if (nextProvider === "grok") {
          next.apiUrl = "https://api.x.ai/v1/chat/completions";
        }

        next.model = isSupportedAiModel(nextProvider, current.model)
          ? current.model
          : getDefaultModelForProvider(nextProvider);
      }

      return next;
    });
    setTestConnectionResult(null);
  }

  async function handleTestConnection() {
    if (!aiSettings.apiUrl.trim() || !aiSettings.apiKey.trim() || !aiSettings.model.trim()) {
      setTestConnectionResult({
        success: false,
        message: "API 주소, 키, 모델명을 모두 입력해 주세요.",
      });
      return;
    }

    setIsTestingConnection(true);
    setTestConnectionResult(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "hi" }],
          config: { ...aiSettings, systemPrompt: "답변은 'OK'라고만 하세요." },
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.content) {
        setTestConnectionResult({
          success: true,
          message: "연결 테스트 성공! AI와 통신할 수 있습니다.",
        });
      } else {
        throw new Error(data?.error ?? "연결에 실패했습니다. 설정을 확인해 주세요.");
      }
    } catch (error) {
      setTestConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsTestingConnection(false);
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
              <h1 className="knowledge-sidebar__title">학문 그래프</h1>
              <button
                type="button"
                className="knowledge-sidebar__toggle"
                onClick={() => setIsSidebarCollapsed(true)}
                aria-label="왼쪽 사이드바 접기"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
            </div>
          </header>

          <div className="knowledge-sidebar__panel-switch">
            <button
              type="button"
              className={`knowledge-sidebar__panel-button ${
                activeTabId !== SETTINGS_TAB.id ? "is-active" : ""
              }`}
              onClick={() => {
                if (activeTabId === SETTINGS_TAB.id) {
                  setActiveTabId(GRAPH_TAB.id);
                }
              }}
            >
              학문
            </button>
            <button
              type="button"
              className={`knowledge-sidebar__panel-button ${
                activeTabId === SETTINGS_TAB.id ? "is-active" : ""
              }`}
              onClick={handleOpenSettings}
            >
              설정
            </button>
          </div>

          {activeTabId === SETTINGS_TAB.id ? (
            <div className="knowledge-sidebar__info" style={{ padding: "16px 8px", color: "#6b7280", fontSize: "0.95rem", lineHeight: "1.6" }}>
              <p>설정 탭이 열려 있습니다. 가운데 메인 섹션에서 상세 설정을 수정하실 수 있습니다.</p>
            </div>
          ) : (
            <>
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
                                    onClick={() =>
                                      openSelection(createDisciplineSelection(discipline.id))
                                    }
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
            </>
          )}
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

      <div
        className={`knowledge-main-shell ${
          isAssistantSidebarCollapsed ? "is-ai-collapsed" : "has-ai-sidebar"
        }`}
        style={assistantShellStyle}
      >
        <div className="knowledge-main">
          <div className={`knowledge-tabbar ${isSidebarCollapsed ? "has-sidebar-toggle" : ""} ${isAssistantSidebarCollapsed ? "has-assistant-toggle" : ""}`}>
            {isSidebarCollapsed ? (
              <button
                type="button"
                className="knowledge-main__sidebar-toggle"
                onClick={() => setIsSidebarCollapsed(false)}
                aria-label="왼쪽 사이드바 열기"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            ) : null}

            <div className="knowledge-tabbar__scroll">
              <button
                type="button"
                className={`knowledge-tab ${activeTabId === GRAPH_TAB.id ? "is-active" : ""}`}
                onClick={() => setActiveTabId(GRAPH_TAB.id)}
              >
                <span>{GRAPH_TAB.label}</span>
              </button>

              {tabs
                .filter((tab) => tab.id !== GRAPH_TAB.id)
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
                        if (tab.kind === "document") {
                          setFocusedSelection(tab.selection);
                          setIsCurriculumExpanded(hasDisciplineStages(tab.selection.discipline));
                        }
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
              {appUser ? (
                <button
                  type="button"
                  className="knowledge-tabbar__user-btn is-authenticated"
                  onClick={handleOpenSettings}
                >
                  <span className="knowledge-tabbar__user-name">{appUser.displayName}</span>
                  <span className="knowledge-tabbar__user-badge">설정</span>
                </button>
              ) : (
                <Link href="/auth?next=/" className="knowledge-tabbar__user-btn">
                  로그인
                </Link>
              )}
              {isAssistantSidebarCollapsed ? (
                <button
                  type="button"
                  className="knowledge-main__assistant-toggle"
                  onClick={() => setIsAssistantSidebarCollapsed(false)}
                  aria-label="오른쪽 인공지능 사이드바 열기"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          <div
            className={`knowledge-main__body ${
              activeTab.kind === "document" || activeTab.kind === "settings"
                ? "knowledge-main__body--document"
                : ""
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
            ) : activeTab.kind === "settings" ? (
              <div className="knowledge-document-scroll">
                <article className="knowledge-document">
                  <header className="knowledge-document__header">
                    <p className="knowledge-document__eyebrow">환경설정</p>
                    <h1 className="knowledge-document__title">설정</h1>
                    <p className="knowledge-document__summary">
                      인공지능 연결 및 애플리케이션 환경설정을 관리합니다.
                    </p>
                  </header>

                  <div className="knowledge-document__body">
                    <div className="knowledge-settings" style={{ maxWidth: "600px", padding: "0" }}>
                      <label className="knowledge-settings__toggle">
                        <input
                          type="checkbox"
                          checked={aiSettings.enabled}
                          onChange={(event) => updateAiSettings("enabled", event.target.checked)}
                        />
                        <span>외부 인공지능 모델 API 사용</span>
                      </label>

                      <label className="knowledge-settings__field">
                        <span>모델 제공자</span>
                        <select
                          className="knowledge-settings__input"
                          value={aiSettings.provider}
                          onChange={(event) =>
                            updateAiSettings(
                              "provider",
                              event.target.value as AiIntegrationSettings["provider"],
                            )
                          }
                        >
                          <option value="openai">OpenAI (GPT)</option>
                          <option value="gemini">Google (Gemini)</option>
                          <option value="grok">xAI (Grok)</option>
                          <option value="custom">직접 입력</option>
                        </select>
                      </label>

                      <label className="knowledge-settings__field">
                        <span>API 주소</span>
                        <input
                          type="url"
                          className="knowledge-settings__input"
                          value={aiSettings.apiUrl}
                          onChange={(event) => updateAiSettings("apiUrl", event.target.value)}
                          placeholder="https://api.openai.com/v1/chat/completions"
                        />
                      </label>

                      <label className="knowledge-settings__field">
                        <span>모델명</span>
                        <select
                          className="knowledge-settings__input"
                          value={aiSettings.model}
                          onChange={(event) => updateAiSettings("model", event.target.value)}
                        >
                          {getAiModelOptions(aiSettings.provider).map((option) => (
                            <option key={`${aiSettings.provider}:${option.value}`} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="knowledge-settings__field">
                        <span>API 키</span>
                        <input
                          type="password"
                          className="knowledge-settings__input"
                          value={aiSettings.apiKey}
                          onChange={(event) => updateAiSettings("apiKey", event.target.value)}
                          placeholder="API 키를 입력하세요"
                          autoComplete="off"
                        />
                      </label>

                      <label className="knowledge-settings__field">
                        <span>시스템 프롬프트 (기본 지시문)</span>
                        <textarea
                          className="knowledge-settings__textarea"
                          value={aiSettings.systemPrompt}
                          onChange={(event) => updateAiSettings("systemPrompt", event.target.value)}
                          placeholder="인공지능에게 항상 전달할 기본 지시문"
                        />
                      </label>

                      <div className="knowledge-settings__actions">
                        <button
                          type="button"
                          className="knowledge-settings__test-btn"
                          disabled={isTestingConnection}
                          onClick={handleTestConnection}
                        >
                          {isTestingConnection ? "연결 확인 중..." : "연결 테스트"}
                        </button>
                      </div>

                      {testConnectionResult && (
                        <div
                          className={`knowledge-settings__test-result ${
                            testConnectionResult.success ? "is-success" : "is-error"
                          }`}
                        >
                          {testConnectionResult.message}
                        </div>
                      )}

                      <p className="knowledge-settings__hint">
                        API 키와 모델 설정은 이 브라우저의 로컬 저장소에만 저장됩니다.
                      </p>
                      <p className="knowledge-settings__status">
                        {hasCustomAiConnection
                          ? "외부 인공지능 API 연결이 활성화되었습니다."
                          : "연결 정보가 비어 있으면 기본 추천 엔진을 사용합니다."}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            ) : activeDocument ? (
              <div className="knowledge-document-scroll">
                <DocumentPanel
                  document={activeDocument}
                  onOpenSelection={openSelection}
                  onAskQuestion={handleDocumentQuestion}
                />
              </div>
            ) : null}
          </div>
        </div>
        {isAssistantSidebarCollapsed ? null : (
          <>
            <div
              className="knowledge-ai-sidebar__resizer"
              role="separator"
              aria-orientation="vertical"
              aria-label="오른쪽 인공지능 사이드바 너비 조절"
              onPointerDown={handleAssistantSidebarResizeStart}
            />

            <aside className="knowledge-ai-sidebar" aria-label="인공지능 대화 패널">
              <header className="knowledge-ai-sidebar__header">
                <div className="knowledge-ai-sidebar__topbar">
                  <button
                    type="button"
                    className="knowledge-ai-sidebar__collapse"
                    onClick={() => setIsAssistantSidebarCollapsed(true)}
                    aria-label="오른쪽 인공지능 사이드바 접기"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6 6-6"/>
                    </svg>
                  </button>
                  <h2 className="knowledge-ai-sidebar__title">인공지능</h2>
                </div>
              </header>

              <div className="knowledge-ai-sidebar__messages" ref={assistantMessagesRef}>
                {assistantMessages.length ? (
                  assistantMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`knowledge-ai-sidebar__message is-${message.role} ${
                        message.tone === "error"
                          ? "is-error"
                          : message.tone === "pending"
                            ? "is-pending"
                            : ""
                      }`}
                    >
                      {message.content.split("\n\n").map((paragraph) => (
                        <p key={`${message.id}:${paragraph}`}>{paragraph}</p>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="knowledge-ai-sidebar__message is-assistant is-placeholder">
                    <p>질문을 입력하면 여기서 인공지능과 대화가 이어집니다.</p>
                  </div>
                )}
              </div>

              <form className="knowledge-assistant" onSubmit={handleAssistantSubmit}>
                <input
                  type="text"
                  className="knowledge-assistant__input"
                  value={assistantQuery}
                  onChange={(event) => setAssistantQuery(event.target.value)}
                  placeholder="인공지능에게 질문하기"
                  aria-label="인공지능에게 질문하기"
                />
                <button
                  type="submit"
                  className="knowledge-assistant__submit"
                  disabled={isAssistantPending || !assistantQuery.trim()}
                >
                  {isAssistantPending ? "답변 중..." : "전송"}
                </button>
              </form>
            </aside>
          </>
        )}
      </div>
    </section>
  );
}
