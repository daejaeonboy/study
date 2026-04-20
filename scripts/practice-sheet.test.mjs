import assert from "node:assert/strict";
import test from "node:test";

import { buildPracticeSheet, countPracticeQuestions } from "../src/lib/practice.ts";

const baseTopic = {
  slug: "gravity",
  title: "중력",
  category: "Physics",
  summary: "질량을 가진 물체 사이의 상호작용을 설명하는 핵심 개념입니다.",
  importance: "과학적 세계관과 우주 이해의 출발점입니다.",
  tags: ["physics", "force"],
  prerequisites: [],
  related: ["spacetime"],
  crossDomainLinks: [
    {
      topicSlug: "philosophy-of-science",
      label: "관찰과 이론",
      reason: "중력 이론은 관찰과 설명 모델의 관계를 보여줍니다.",
    },
  ],
  sources: [],
  layers: {
    light: {
      title: "중력 입문",
      description: "중력을 일상 경험으로 이해합니다.",
      body: ["사과가 떨어지는 현상은 중력의 친숙한 예입니다."],
      keyIdeas: ["끌어당김", "질량", "낙하"],
      questions: ["중력을 한 문장으로 설명하면 무엇입니까?"],
      bridgePrompt: "일상 경험에서 중력이 보이는 장면을 찾아보세요.",
    },
    core: {
      title: "중력의 구조",
      description: "힘과 장의 관점으로 중력을 정리합니다.",
      body: ["중력은 물체의 운동과 궤도를 설명합니다."],
      keyIdeas: ["힘", "장", "궤도"],
      questions: ["질량이 커지면 중력은 어떻게 달라집니까?"],
      bridgePrompt: "궤도 운동을 중력으로 설명해보세요.",
    },
    deep: {
      title: "중력의 심화",
      description: "시공간과 일반상대성이론으로 확장합니다.",
      body: ["일반상대성이론은 중력을 시공간의 휘어짐으로 설명합니다."],
      keyIdeas: ["시공간", "곡률", "상대성이론"],
      questions: [],
      bridgePrompt: "힘 설명과 시공간 설명을 비교해보세요.",
    },
  },
};

test("builds one printable practice section for each topic layer", () => {
  const sheet = buildPracticeSheet(baseTopic);

  assert.equal(sheet.topicSlug, "gravity");
  assert.equal(sheet.title, "중력 연습지");
  assert.deepEqual(
    sheet.sections.map((section) => section.depth),
    ["light", "core", "deep"],
  );
  assert.ok(sheet.estimatedMinutes >= 20);
  assert.equal(countPracticeQuestions(sheet), 12);
});

test("uses authored self-check questions before generated practice prompts", () => {
  const sheet = buildPracticeSheet(baseTopic);
  const [firstLightQuestion] = sheet.sections[0].questions;

  assert.equal(firstLightQuestion.prompt, "중력을 한 문장으로 설명하면 무엇입니까?");
  assert.equal(firstLightQuestion.kind, "short_answer");
  assert.equal(firstLightQuestion.answerLines, 4);
});

test("adds concept, application, bridge, and synthesis prompts", () => {
  const sheet = buildPracticeSheet(baseTopic);
  const questionKinds = sheet.sections.flatMap((section) =>
    section.questions.map((question) => question.kind),
  );

  assert.ok(questionKinds.includes("concept_recall"));
  assert.ok(questionKinds.includes("application"));
  assert.ok(questionKinds.includes("bridge"));
  assert.equal(sheet.synthesisPrompts.length, 2);
  assert.match(sheet.synthesisPrompts[0], /중력/);
});

test("generates reproducible but different light practice sets by seed", () => {
  const first = buildPracticeSheet(baseTopic, { seed: "attempt-a", mode: "light" });
  const firstAgain = buildPracticeSheet(baseTopic, { seed: "attempt-a", mode: "light" });
  const second = buildPracticeSheet(baseTopic, { seed: "attempt-b", mode: "light" });

  assert.deepEqual(first, firstAgain);
  assert.notDeepEqual(
    first.sections.flatMap((section) => section.questions.map((question) => question.prompt)),
    second.sections.flatMap((section) => section.questions.map((question) => question.prompt)),
  );
  assert.equal(first.sections.length, 1);
  assert.equal(first.sections[0].depth, "light");
});

test("uses active admin-authored templates before generated fallback questions", () => {
  const sheet = buildPracticeSheet(baseTopic, {
    seed: "template-seed",
    mode: "light",
    templates: [
      {
        id: "template-1",
        topicSlug: "gravity",
        depth: "light",
        kind: "application",
        prompt: "운영자가 만든 가벼운 적용 문제입니다.",
        guide: "짧게 답해도 됩니다.",
        answerLines: 3,
        modelAnswer: "중력 개념을 실제 사례에 적용한다.",
        rubric: "사례와 개념이 모두 있으면 좋습니다.",
        isActive: true,
      },
      {
        id: "template-2",
        topicSlug: "gravity",
        depth: "light",
        kind: "application",
        prompt: "비활성 문제입니다.",
        guide: "",
        answerLines: 3,
        isActive: false,
      },
    ],
  });

  assert.equal(sheet.sections[0].questions[0].prompt, "운영자가 만든 가벼운 적용 문제입니다.");
  assert.equal(sheet.sections[0].questions[0].modelAnswer, "중력 개념을 실제 사례에 적용한다.");
  assert.equal(sheet.sections[0].questions[0].rubric, "사례와 개념이 모두 있으면 좋습니다.");
  assert.ok(sheet.sections[0].questions.every((question) => !question.prompt.includes("비활성")));
});
