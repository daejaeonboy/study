"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAppUser } from "@/components/providers/app-user-provider";
import type { Topic } from "@/lib/domain";
import { buildPracticeSheet, type PracticeQuestionTemplate } from "@/lib/practice";

function getQuestionKindLabel(kind: string) {
  return {
    short_answer: "단답/서술",
    concept_recall: "개념 연결",
    application: "적용",
    bridge: "브리지",
  }[kind] ?? kind;
}

function createAnswerState(sheet: ReturnType<typeof buildPracticeSheet>) {
  const entries = [
    ...sheet.sections.flatMap((section) => section.questions.map((question) => question.id)),
    ...sheet.synthesisPrompts.map((_, index) => `synthesis-${index}`),
  ].map((id) => [id, ""]);

  return Object.fromEntries(entries) as Record<string, string>;
}

function createPracticeSeed() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function PracticeView({
  topic,
  templates,
  initialSeed,
}: {
  topic: Topic;
  templates: PracticeQuestionTemplate[];
  initialSeed: string;
}) {
  const appUser = useAppUser();
  const [seed, setSeed] = useState(initialSeed);
  const sheet = useMemo(
    () => buildPracticeSheet(topic, { seed, mode: "light", templates }),
    [topic, seed, templates],
  );
  const [answers, setAnswers] = useState(() => createAnswerState(sheet));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const answerIds = useMemo(() => Object.keys(createAnswerState(sheet)), [sheet]);
  const answeredCount = answerIds.filter((id) => answers[id]?.trim()).length;
  const questionTotal = answerIds.length;

  useEffect(() => {
    setAnswers(createAnswerState(sheet));
    setSaveStatus("idle");
    setSaveMessage(null);
  }, [sheet]);

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [id]: value,
    }));
  }

  function handlePrint() {
    window.print();
  }

  function handleNewPracticeSet() {
    setSeed(createPracticeSeed());
  }

  async function handleSaveAttempt() {
    setSaveStatus("saving");
    setSaveMessage(null);

    try {
      const response = await fetch("/api/practice-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicSlug: sheet.topicSlug,
          seed: sheet.seed,
          mode: sheet.mode,
          sheet,
          answers,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "풀이 저장에 실패했습니다.");
      }

      setSaveStatus("saved");
      setSaveMessage("이번 풀이를 저장했습니다. 새 문제를 만들면 별도 시도로 저장할 수 있습니다.");
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage(error instanceof Error ? error.message : "풀이 저장에 실패했습니다.");
    }
  }

  return (
    <section className="view practice-view">
      <header className="practice-screen-only stack" style={{ gap: "var(--space-6)" }}>
        <div className="stack" style={{ gap: "var(--space-4)" }}>
          <span className="caption" style={{ color: "var(--accent)" }}>
            PRACTICE SHEET
          </span>
          <h1 className="hero-title">{sheet.title}</h1>
          <p className="hero-copy" style={{ maxWidth: "860px" }}>
            읽은 내용을 가볍게 확인하는 문제 세트입니다. 새 문제를 만들 때마다 다른 seed로
            문항이 다시 구성되고, 답변이 들어간 상태 그대로 인쇄할 수 있습니다.
          </p>
        </div>

        <div className="metrics">
          <div className="metric">
            <strong>{answeredCount}/{questionTotal}</strong>
            <span>작성한 답변</span>
          </div>
          <div className="metric">
            <strong>{sheet.estimatedMinutes}분</strong>
            <span>예상 풀이 시간</span>
          </div>
          <div className="metric">
            <strong>{sheet.sections.length}</strong>
            <span>학습 단계</span>
          </div>
          <div className="metric">
            <strong>{sheet.seed.slice(0, 8)}</strong>
            <span>문제 세트</span>
          </div>
        </div>

        <div className="hero-actions">
          <button type="button" className="btn btn-secondary" onClick={handleNewPracticeSet}>
            새 문제 만들기
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveAttempt}
            disabled={!appUser || saveStatus === "saving"}
          >
            {saveStatus === "saving" ? "저장 중..." : "풀이 저장"}
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            인쇄하기
          </button>
          <Link href={`/topic/${sheet.topicSlug}`} className="btn btn-secondary">
            Topic으로 돌아가기
          </Link>
        </div>
        {!appUser ? (
          <div className="surface" style={{ padding: "var(--space-4)", border: "1px solid var(--warning-border)" }}>
            <p className="muted">로그인하면 풀이 시도를 저장할 수 있습니다. 인쇄와 새 문제 생성은 로그인 없이도 사용할 수 있습니다.</p>
          </div>
        ) : null}
        {saveMessage ? (
          <div
            className="surface"
            style={{
              padding: "var(--space-4)",
              border:
                saveStatus === "error"
                  ? "1px solid var(--danger-border)"
                  : "1px solid var(--success-border)",
            }}
          >
            <p className="muted">{saveMessage}</p>
          </div>
        ) : null}
      </header>

      <main className="printable-sheet">
        <section className="practice-sheet-cover">
          <div>
            <span className="caption">PRINTABLE WORKSHEET</span>
            <h2>{sheet.title}</h2>
            <p>{sheet.subtitle}</p>
          </div>
          <div className="practice-sheet-meta">
            <span>이름</span>
            <span>날짜</span>
            <span>세트 {sheet.seed.slice(0, 12)}</span>
            <span>예상 {sheet.estimatedMinutes}분</span>
          </div>
        </section>

        {sheet.sections.map((section) => (
          <section key={section.depth} className="practice-section">
            <div className="practice-section__head">
              <span className="chip chip--accent">{section.depth}</span>
              <div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
            </div>

            <div className="practice-question-list">
              {section.questions.map((question, index) => (
                <article key={question.id} className="practice-question">
                  <div className="practice-question__meta">
                    <span className="caption">Q{index + 1}</span>
                    <span className="chip">{getQuestionKindLabel(question.kind)}</span>
                  </div>
                  <label className="stack" style={{ gap: "var(--space-3)" }}>
                    <strong>{question.prompt}</strong>
                    <span className="muted">{question.guide}</span>
                    <textarea
                      className="plain-input practice-answer"
                      value={answers[question.id] ?? ""}
                      onChange={(event) => updateAnswer(question.id, event.target.value)}
                      rows={question.answerLines}
                      placeholder="여기에 답을 작성하세요."
                    />
                    {question.modelAnswer || question.rubric ? (
                      <details className="practice-reference">
                        <summary>모범 답안과 채점 기준</summary>
                        {question.modelAnswer ? <p>{question.modelAnswer}</p> : null}
                        {question.rubric ? <p>{question.rubric}</p> : null}
                      </details>
                    ) : null}
                  </label>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="practice-section practice-section--synthesis">
          <div className="practice-section__head">
            <span className="chip chip--alt">final</span>
            <div>
              <h3>종합 문제</h3>
              <p>세 단계의 답변을 다시 묶어 하나의 이해로 정리합니다.</p>
            </div>
          </div>

          <div className="practice-question-list">
            {sheet.synthesisPrompts.map((prompt, index) => {
              const id = `synthesis-${index}`;

              return (
                <article key={id} className="practice-question">
                  <div className="practice-question__meta">
                    <span className="caption">S{index + 1}</span>
                    <span className="chip">종합</span>
                  </div>
                  <label className="stack" style={{ gap: "var(--space-3)" }}>
                    <strong>{prompt}</strong>
                    <textarea
                      className="plain-input practice-answer"
                      value={answers[id] ?? ""}
                      onChange={(event) => updateAnswer(id, event.target.value)}
                      rows={6}
                      placeholder="여기에 답을 작성하세요."
                    />
                  </label>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </section>
  );
}
