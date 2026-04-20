import type { LayerDepth, Topic } from "@/lib/domain";

export type PracticeQuestionKind = "short_answer" | "concept_recall" | "application" | "bridge";
export type PracticeMode = "light";

export interface PracticeQuestion {
  id: string;
  depth: LayerDepth;
  kind: PracticeQuestionKind;
  prompt: string;
  guide: string;
  answerLines: number;
  modelAnswer?: string;
  rubric?: string;
  templateId?: string;
}

export interface PracticeQuestionTemplate {
  id: string;
  topicSlug: string;
  depth: LayerDepth;
  kind: PracticeQuestionKind;
  prompt: string;
  guide: string;
  answerLines: number;
  modelAnswer?: string;
  rubric?: string;
  isActive: boolean;
}

export interface PracticeSection {
  depth: LayerDepth;
  title: string;
  description: string;
  questions: PracticeQuestion[];
}

export interface PracticeSheet {
  topicSlug: string;
  title: string;
  subtitle: string;
  seed: string;
  mode: PracticeMode;
  estimatedMinutes: number;
  sections: PracticeSection[];
  synthesisPrompts: string[];
}

const depthSequence: LayerDepth[] = ["light", "core", "deep"];
const DEFAULT_SEED = "default";

function formatPracticeDepth(depth: LayerDepth) {
  return { light: "Light", core: "Core", deep: "Deep" }[depth];
}

function createQuestion({
  topicSlug,
  depth,
  seed = DEFAULT_SEED,
  index,
  kind,
  prompt,
  guide,
  answerLines = 4,
  modelAnswer,
  rubric,
  templateId,
}: {
  topicSlug: string;
  depth: LayerDepth;
  seed?: string;
  index: number;
  kind: PracticeQuestionKind;
  prompt: string;
  guide: string;
  answerLines?: number;
  modelAnswer?: string;
  rubric?: string;
  templateId?: string;
}): PracticeQuestion {
  return {
    id: `${topicSlug}-${seed}-${depth}-${index}`,
    depth,
    kind,
    prompt,
    guide,
    answerLines,
    modelAnswer,
    rubric,
    templateId,
  };
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

function pickSeeded<T>(items: T[], seed: string, salt: string) {
  return items[hashString(`${seed}:${salt}`) % items.length];
}

function buildTemplateQuestions({
  topic,
  depth,
  seed,
  templates,
}: {
  topic: Topic;
  depth: LayerDepth;
  seed: string;
  templates: PracticeQuestionTemplate[];
}) {
  return templates
    .filter((template) => template.isActive && template.topicSlug === topic.slug && template.depth === depth)
    .map((template, index) =>
      createQuestion({
        topicSlug: topic.slug,
        depth,
        seed,
        index: index + 1,
        kind: template.kind,
        prompt: template.prompt,
        guide: template.guide,
        answerLines: template.answerLines,
        modelAnswer: template.modelAnswer,
        rubric: template.rubric,
        templateId: template.id,
      }),
    );
}

function buildLayerQuestions(
  topic: Topic,
  depth: LayerDepth,
  {
    seed,
    templates,
  }: {
    seed: string;
    templates: PracticeQuestionTemplate[];
  },
): PracticeQuestion[] {
  const layer = topic.layers[depth];
  const authoredQuestion =
    layer.questions?.find((question) => question.trim().length > 0) ??
    `${layer.title}의 핵심 설명을 내 말로 다시 써보세요.`;
  const conceptList = layer.keyIdeas.slice(0, 4).join(", ") || topic.tags.slice(0, 4).join(", ");
  const seeded = seed !== DEFAULT_SEED;
  const shortAnswerPrompt = seeded
    ? pickSeeded(
        [
          authoredQuestion,
          `${layer.title}를 처음 배우는 사람에게 3문장으로 설명하세요.`,
          `${topic.title}에서 오해하기 쉬운 점 하나를 고르고 바로잡아보세요.`,
        ],
        seed,
        `${depth}:short`,
      )
    : authoredQuestion;
  const conceptPrompt = seeded
    ? pickSeeded(
        [
          `${formatPracticeDepth(depth)} 단계의 핵심 개념 중 2개를 골라 서로 어떤 관계인지 설명하세요.`,
          `${conceptList || topic.title} 중 하나를 골라 원인, 과정, 결과로 나누어 설명하세요.`,
          `본문에서 가장 중요한 용어 하나를 골라 예시와 함께 정의하세요.`,
        ],
        seed,
        `${depth}:concept`,
      )
    : `${formatPracticeDepth(depth)} 단계의 핵심 개념 중 2개를 골라 서로 어떤 관계인지 설명하세요.`;
  const applicationPrompt = seeded
    ? pickSeeded(
        [
          `${topic.title}을(를) 실제 사례 하나에 적용해 설명하세요.`,
          `${topic.title}이(가) 일상적 판단이나 다른 학문 문제에 어떻게 쓰일 수 있는지 예를 들어보세요.`,
          `${topic.title}을(를) 설명하기 좋은 비유를 만들고, 그 비유의 한계를 적어보세요.`,
        ],
        seed,
        `${depth}:application`,
      )
    : `${topic.title}을(를) 실제 사례 하나에 적용해 설명하세요.`;
  const bridgePrompt = seeded
    ? pickSeeded(
        [
          layer.bridgePrompt,
          `${formatPracticeDepth(depth)} 단계에서 다음에 더 물어봐야 할 질문 하나를 만들고 이유를 적으세요.`,
          `이 단계의 설명이 이전에 알던 생각을 어떻게 바꾸는지 비교하세요.`,
        ],
        seed,
        `${depth}:bridge`,
      )
    : layer.bridgePrompt;
  const templateQuestions = buildTemplateQuestions({ topic, depth, seed, templates });
  const startIndex = templateQuestions.length;

  const generatedQuestions = [
    createQuestion({
      topicSlug: topic.slug,
      depth,
      seed,
      index: startIndex + 1,
      kind: "short_answer",
      prompt: shortAnswerPrompt,
      guide: "핵심어를 그대로 베끼기보다, 스스로 이해한 문장으로 답해보세요.",
      answerLines: 4,
      modelAnswer: `${topic.title}의 핵심 의미를 설명하고, 왜 중요한지 한 가지 이유를 덧붙입니다.`,
      rubric: "핵심 개념, 자기 문장, 이유가 모두 들어가면 좋은 답입니다.",
    }),
    createQuestion({
      topicSlug: topic.slug,
      depth,
      seed,
      index: startIndex + 2,
      kind: "concept_recall",
      prompt: conceptPrompt,
      guide: conceptList ? `활용 가능한 개념: ${conceptList}` : "본문에서 반복되는 용어를 먼저 표시해보세요.",
      answerLines: 5,
      modelAnswer: `두 개념을 각각 정의한 뒤, 원인-결과 또는 포함-대비 관계로 연결합니다.`,
      rubric: "개념 정의가 정확하고 두 개념 사이의 관계가 분명해야 합니다.",
    }),
    createQuestion({
      topicSlug: topic.slug,
      depth,
      seed,
      index: startIndex + 3,
      kind: "application",
      prompt: applicationPrompt,
      guide: "사례, 적용한 개념, 결론의 순서로 적으면 좋습니다.",
      answerLines: 5,
      modelAnswer: `구체적인 사례를 하나 제시하고, ${topic.title}의 핵심 개념으로 그 사례를 해석합니다.`,
      rubric: "사례가 구체적이고 적용한 개념이 본문과 연결되면 좋습니다.",
    }),
    createQuestion({
      topicSlug: topic.slug,
      depth,
      seed,
      index: startIndex + 4,
      kind: "bridge",
      prompt: bridgePrompt,
      guide: "이전 단계의 생각과 지금 단계의 생각이 어떻게 달라졌는지 비교해보세요.",
      answerLines: 5,
      modelAnswer: "이전 이해와 현재 이해를 비교하고, 다음 탐구 질문을 하나 제시합니다.",
      rubric: "비교점과 다음 질문이 모두 드러나면 좋은 답입니다.",
    }),
  ];

  return [...templateQuestions, ...generatedQuestions];
}

function buildSynthesisPrompts(topic: Topic) {
  const crossDomain = topic.crossDomainLinks[0];
  const related = topic.related[0] ?? topic.prerequisites[0];

  return [
    `${topic.title}에서 가장 중요한 개념 하나를 고르고, 왜 이 주제가 ${topic.category} 학습에서 중요한지 설명하세요.`,
    crossDomain
      ? `${topic.title}와(과) ${crossDomain.label}의 연결을 바탕으로, 다른 분야의 질문 하나를 만들어보세요.`
      : related
        ? `${topic.title}와(과) ${related}를 이어주는 질문 하나를 만들어보세요.`
        : `${topic.title}를 더 깊게 공부하기 위해 다음에 확인해야 할 질문 하나를 만들어보세요.`,
  ];
}

export function buildPracticeSheet(
  topic: Topic,
  options: {
    seed?: string;
    mode?: PracticeMode;
    templates?: PracticeQuestionTemplate[];
  } = {},
): PracticeSheet {
  const seed = options.seed ?? DEFAULT_SEED;
  const mode = options.mode ?? "light";
  const selectedDepths = options.seed || options.mode ? (["light"] as LayerDepth[]) : depthSequence;
  const templates = options.templates ?? [];
  const sections = selectedDepths.map((depth) => {
    const layer = topic.layers[depth];

    return {
      depth,
      title: `${formatPracticeDepth(depth)} 문제`,
      description: layer.description,
      questions: buildLayerQuestions(topic, depth, { seed, templates }),
    };
  });
  const questionCount = sections.reduce((sum, section) => sum + section.questions.length, 0);

  return {
    topicSlug: topic.slug,
    title: `${topic.title} 연습지`,
    subtitle: topic.summary,
    seed,
    mode,
    estimatedMinutes: Math.max(20, questionCount * 4),
    sections,
    synthesisPrompts: buildSynthesisPrompts(topic),
  };
}

export function countPracticeQuestions(sheet: PracticeSheet) {
  return sheet.sections.reduce((sum, section) => sum + section.questions.length, 0);
}
