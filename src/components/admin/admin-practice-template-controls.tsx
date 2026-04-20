"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import type { LayerDepth } from "@/lib/domain";
import type { PracticeQuestionKind, PracticeQuestionTemplate } from "@/lib/practice";

const questionKinds: PracticeQuestionKind[] = [
  "short_answer",
  "concept_recall",
  "application",
  "bridge",
];

const questionKindLabels: Record<PracticeQuestionKind, string> = {
  short_answer: "단답/서술",
  concept_recall: "개념 연결",
  application: "적용",
  bridge: "브리지",
};

function createBlankTemplate(topicSlug: string): Omit<PracticeQuestionTemplate, "id"> {
  return {
    topicSlug,
    depth: "light",
    kind: "application",
    prompt: "",
    guide: "짧게 답해도 됩니다.",
    answerLines: 4,
    modelAnswer: "",
    rubric: "",
    isActive: true,
  };
}

function TemplateEditor({
  template,
  isNew,
  disabled,
  onSave,
}: {
  template: PracticeQuestionTemplate | Omit<PracticeQuestionTemplate, "id">;
  isNew?: boolean;
  disabled?: boolean;
  onSave: (template: PracticeQuestionTemplate | Omit<PracticeQuestionTemplate, "id">) => Promise<void>;
}) {
  const [draft, setDraft] = useState(template);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!draft.prompt.trim()) {
      setNotice("문제 문항을 입력해야 합니다.");
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      await onSave(draft);
      setNotice(isNew ? "새 문제 템플릿을 저장했습니다." : "문제 템플릿을 저장했습니다.");
      if (isNew) {
        setDraft(createBlankTemplate(draft.topicSlug));
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "문제 템플릿 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="surface" style={{ padding: "var(--space-5)", background: "var(--bg-subtle)" }}>
      <div className="stack" style={{ gap: "var(--space-4)" }}>
        <div className="grid-3">
          <label className="stack" style={{ gap: "8px" }}>
            <span className="caption">단계</span>
            <select
              className="plain-input"
              value={draft.depth}
              onChange={(event) =>
                setDraft((current) => ({ ...current, depth: event.target.value as LayerDepth }))
              }
              disabled={disabled || isSaving}
            >
              <option value="light">Light</option>
              <option value="core">Core</option>
              <option value="deep">Deep</option>
            </select>
          </label>

          <label className="stack" style={{ gap: "8px" }}>
            <span className="caption">유형</span>
            <select
              className="plain-input"
              value={draft.kind}
              onChange={(event) =>
                setDraft((current) => ({ ...current, kind: event.target.value as PracticeQuestionKind }))
              }
              disabled={disabled || isSaving}
            >
              {questionKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {questionKindLabels[kind]}
                </option>
              ))}
            </select>
          </label>

          <label className="stack" style={{ gap: "8px" }}>
            <span className="caption">답안 줄 수</span>
            <input
              className="plain-input"
              type="number"
              min={2}
              max={10}
              value={draft.answerLines}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  answerLines: Number.parseInt(event.target.value, 10) || 4,
                }))
              }
              disabled={disabled || isSaving}
            />
          </label>
        </div>

        <label className="stack" style={{ gap: "8px" }}>
          <span className="caption">문항</span>
          <textarea
            className="plain-input"
            value={draft.prompt}
            onChange={(event) => setDraft((current) => ({ ...current, prompt: event.target.value }))}
            disabled={disabled || isSaving}
            style={{ minHeight: "92px" }}
          />
        </label>

        <label className="stack" style={{ gap: "8px" }}>
          <span className="caption">풀이 가이드</span>
          <input
            className="plain-input"
            value={draft.guide}
            onChange={(event) => setDraft((current) => ({ ...current, guide: event.target.value }))}
            disabled={disabled || isSaving}
          />
        </label>

        <label className="stack" style={{ gap: "8px" }}>
          <span className="caption">모범 답안</span>
          <textarea
            className="plain-input"
            value={draft.modelAnswer ?? ""}
            onChange={(event) =>
              setDraft((current) => ({ ...current, modelAnswer: event.target.value }))
            }
            disabled={disabled || isSaving}
            style={{ minHeight: "92px" }}
          />
        </label>

        <label className="stack" style={{ gap: "8px" }}>
          <span className="caption">채점 기준</span>
          <textarea
            className="plain-input"
            value={draft.rubric ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, rubric: event.target.value }))}
            disabled={disabled || isSaving}
            style={{ minHeight: "92px" }}
          />
        </label>

        <label style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) =>
              setDraft((current) => ({ ...current, isActive: event.target.checked }))
            }
            disabled={disabled || isSaving}
          />
          <span className="muted">활성 문제로 사용</span>
        </label>

        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSave}
            disabled={disabled || isSaving}
          >
            {isSaving ? "저장 중..." : isNew ? "새 문제 저장" : "문제 저장"}
          </button>
          {notice ? <span className="caption">{notice}</span> : null}
        </div>
      </div>
    </article>
  );
}

export function AdminPracticeTemplateControls({
  topicSlug,
  templates,
  remotePersistenceEnabled,
}: {
  topicSlug: string;
  templates: PracticeQuestionTemplate[];
  remotePersistenceEnabled: boolean;
}) {
  const router = useRouter();
  const [localTemplates, setLocalTemplates] = useState(templates);

  async function saveTemplate(template: PracticeQuestionTemplate | Omit<PracticeQuestionTemplate, "id">) {
    const response = await fetch(`/api/admin/topics/${topicSlug}/practice-templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });
    const payload = (await response.json().catch(() => null)) as {
      template?: PracticeQuestionTemplate;
      error?: string;
    } | null;

    if (!response.ok || !payload?.template) {
      throw new Error(payload?.error ?? "문제 템플릿 저장에 실패했습니다.");
    }

    setLocalTemplates((current) => {
      const next = current.filter((item) => item.id !== payload.template?.id);
      return [...next, payload.template as PracticeQuestionTemplate];
    });
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="surface-elevated" style={{ padding: "var(--space-6)" }}>
      <div className="section-head">
        <h2 className="section-title">문제 템플릿</h2>
        <p className="muted">
          사용자 연습지에 우선 반영할 가벼운 문제, 모범 답안, 채점 기준을 관리합니다.
        </p>
      </div>

      <div className="stack" style={{ gap: "var(--space-5)", marginTop: "var(--space-5)" }}>
        {!remotePersistenceEnabled ? (
          <div className="surface" style={{ padding: "var(--space-4)", border: "1px solid var(--line)" }}>
            <p className="muted">Supabase write 설정이 없어 문제 템플릿 저장은 비활성화되어 있습니다.</p>
          </div>
        ) : null}

        {localTemplates.map((template) => (
          <TemplateEditor
            key={template.id}
            template={template}
            disabled={!remotePersistenceEnabled}
            onSave={saveTemplate}
          />
        ))}

        <TemplateEditor
          template={createBlankTemplate(topicSlug)}
          isNew
          disabled={!remotePersistenceEnabled}
          onSave={saveTemplate}
        />
      </div>
    </section>
  );
}
