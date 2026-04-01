import { bundledTopics } from "@/content/topic-bundles";
import {
  defaultDisciplineFromTopicCategory,
  findBranchByDiscipline,
  findDisciplineStage,
  findStageByTopic,
  getDisciplineProfile,
} from "@/lib/disciplines";
import type { LayerDepth, Topic } from "@/lib/domain";

export type GraphSelection =
  | {
      kind: "discipline";
      discipline: string;
      stage: null;
      topic: null;
    }
  | {
      kind: "stage";
      discipline: string;
      stage: string;
      topic: null;
    }
  | {
      kind: "topic";
      discipline: string;
      stage: string;
      topic: string;
    };

export type GraphDocument = {
  id: string;
  tabTitle: string;
  eyebrow: string;
  title: string;
  summary: string;
  meta: string[];
  sections: Array<{
    title: string;
    body: string[];
    kind?: "prose" | "questions";
  }>;
  related: Array<{
    label: string;
    selection: GraphSelection;
  }>;
};

const TOPIC_ALIAS_BY_TITLE: Record<string, string> = {
  "존재와 동일성": "metaphysics",
  "행복과 덕": "ethics",
  "의무와 결과": "ethics",
  정의: "political-philosophy",
  "자유와 권리": "political-philosophy",
};

const topicByTitle = new Map(bundledTopics.map((topic) => [topic.title, topic]));
const topicBySlug = new Map(bundledTopics.map((topic) => [topic.slug, topic]));

export function createDisciplineSelection(discipline: string): GraphSelection {
  return {
    kind: "discipline",
    discipline,
    stage: null,
    topic: null,
  };
}

export function createStageSelection(discipline: string, stage: string): GraphSelection {
  return {
    kind: "stage",
    discipline,
    stage,
    topic: null,
  };
}

export function createTopicSelection(
  discipline: string,
  stage: string,
  topic: string,
): GraphSelection {
  return {
    kind: "topic",
    discipline,
    stage,
    topic,
  };
}

export function getGraphTabId(selection: GraphSelection) {
  if (selection.kind === "discipline") {
    return `discipline:${selection.discipline}`;
  }

  if (selection.kind === "stage") {
    return `stage:${selection.discipline}:${selection.stage}`;
  }

  return `topic:${selection.discipline}:${selection.stage}:${selection.topic}`;
}

export function getGraphTabLabel(selection: GraphSelection) {
  if (selection.kind === "discipline") {
    return selection.discipline;
  }

  if (selection.kind === "stage") {
    return selection.stage;
  }

  return selection.topic;
}

function resolveBundledTopicByTitle(title?: string | null) {
  if (!title) {
    return null;
  }

  const exact = topicByTitle.get(title);

  if (exact) {
    return exact;
  }

  const aliasedSlug = TOPIC_ALIAS_BY_TITLE[title];
  return aliasedSlug ? topicBySlug.get(aliasedSlug) ?? null : null;
}

function createSelectionFromTopicSlug(
  slug: string,
  fallbackDiscipline: string,
  fallbackStage: string,
): GraphSelection | null {
  const topic = topicBySlug.get(slug);

  if (!topic) {
    return null;
  }

  const discipline = defaultDisciplineFromTopicCategory(topic.category) ?? fallbackDiscipline;
  const stage = findStageByTopic(discipline, topic.title)?.level ?? fallbackStage;

  return createTopicSelection(discipline, stage, topic.title);
}

function dedupeRelated(
  items: Array<{
    label: string;
    selection: GraphSelection;
  }>,
  currentSelection: GraphSelection,
) {
  const seen = new Set<string>([getGraphTabId(currentSelection)]);

  return items.filter((item) => {
    const id = getGraphTabId(item.selection);

    if (seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
}

function buildBundledTopicDocument(
  selection: Extract<GraphSelection, { kind: "topic" }>,
  topic: Topic,
): GraphDocument {
  const isAliasedTopic = selection.topic !== topic.title;
  const orderedDepths = ["light", "core", "deep"] as LayerDepth[];
  const topicStage =
    findStageByTopic(selection.discipline, selection.topic) ??
    findStageByTopic(selection.discipline, topic.title) ??
    findStageByTopic(defaultDisciplineFromTopicCategory(topic.category), topic.title) ??
    findDisciplineStage(selection.discipline, selection.stage);
  const mergedBody = orderedDepths.flatMap((depth) => {
    const layer = topic.layers[depth];

    return [
      layer.description,
      ...layer.body,
    ];
  });
  const faqQuestions = Array.from(
    new Set(
      orderedDepths.flatMap((depth) => topic.layers[depth].questions ?? []),
    ),
  );
  const fallbackQuestions = [
    `${selection.topic}의 정의를 자기 말로 설명할 수 있는가?`,
    `${selection.topic}이 왜 중요한지 예시와 함께 말할 수 있는가?`,
    `${selection.topic}이 다음 주제와 어떻게 이어지는지 설명할 수 있는가?`,
  ];

  const relatedSelections = [
    ...topic.prerequisites
      .map((slug) => {
        const relatedSelection = createSelectionFromTopicSlug(
          slug,
          selection.discipline,
          topicStage?.level ?? selection.stage,
        );

        if (!relatedSelection) {
          return null;
        }

        return {
          label: topicBySlug.get(slug)?.title ?? slug,
          selection: relatedSelection,
        };
      })
      .filter(Boolean),
    ...topic.related
      .map((slug) => {
        const relatedSelection = createSelectionFromTopicSlug(
          slug,
          selection.discipline,
          topicStage?.level ?? selection.stage,
        );

        if (!relatedSelection) {
          return null;
        }

        return {
          label: topicBySlug.get(slug)?.title ?? slug,
          selection: relatedSelection,
        };
      })
      .filter(Boolean),
    ...(topicStage
      ? [
          {
            label: `${topicStage.level} 돌아가기`,
            selection: createStageSelection(selection.discipline, topicStage.level),
          },
        ]
      : []),
    {
      label: `${selection.discipline} 개요`,
      selection: createDisciplineSelection(selection.discipline),
    },
  ] as Array<{
    label: string;
    selection: GraphSelection;
  }>;

  return {
    id: getGraphTabId(selection),
    tabTitle: selection.topic,
    eyebrow: `${selection.discipline} · 실제 학습 문서`,
    title: selection.topic,
    summary: isAliasedTopic
      ? `${selection.topic}은 ${topic.title}의 핵심 논점을 중심으로 읽습니다. ${topic.summary}`
      : topic.summary,
    meta: [
      topic.category,
      topicStage ? `${topicStage.level} · ${topicStage.title}` : "연결 주제",
      "학습 문서",
    ],
    sections: [
      {
        title: "왜 중요한가",
        body: [
          ...(isAliasedTopic
            ? [`이 문서는 ${selection.topic}을 ${topic.title}의 중심 논점과 연결해 읽습니다.`]
            : []),
          topic.summary,
          topic.importance,
        ],
      },
      {
        title: "본문",
        body: mergedBody,
      },
      {
        title: "자주 묻는 질문",
        body: faqQuestions.length ? faqQuestions : fallbackQuestions,
        kind: "questions",
      },
    ],
    related: dedupeRelated(relatedSelections, selection).slice(0, 8),
  };
}

export function buildGraphDocument(selection: GraphSelection): GraphDocument {
  const profile = getDisciplineProfile(selection.discipline);
  const branch = findBranchByDiscipline(selection.discipline);

  if (selection.kind === "discipline") {
    const stages = profile.stages ?? [];
    const siblingDisciplines = (branch?.disciplines ?? [])
      .filter((discipline) => discipline !== selection.discipline)
      .slice(0, 4);

    return {
      id: getGraphTabId(selection),
      tabTitle: getGraphTabLabel(selection),
      eyebrow: branch?.label ?? "학문 개요",
      title: selection.discipline,
      summary: profile.summary,
      meta: [
        `${profile.questions.length}개의 질문`,
        `${profile.approaches.length}개의 접근`,
        stages.length ? `${stages.length}개의 단계` : "단계 없음",
      ],
      sections: [
        {
          title: "핵심 질문",
          body: profile.questions,
          kind: "questions",
        },
        {
          title: "주요 접근",
          body: profile.approaches.map((approach) => `${approach} 중심으로 읽습니다.`),
        },
        ...(stages.length
          ? [
              {
                title: "단계별 흐름",
                body: stages.map(
                  (stage) => `${stage.level} · ${stage.title}: ${stage.summary}`,
                ),
              },
            ]
          : []),
      ],
      related: [
        ...stages.slice(0, 4).map((stage) => ({
          label: `${stage.level} · ${stage.title}`,
          selection: createStageSelection(selection.discipline, stage.level),
        })),
        ...siblingDisciplines.map((discipline) => ({
          label: discipline,
          selection: createDisciplineSelection(discipline),
        })),
      ],
    };
  }

  if (selection.kind === "stage") {
    const stage = findDisciplineStage(selection.discipline, selection.stage);

    if (!stage) {
      return buildGraphDocument(createDisciplineSelection(selection.discipline));
    }

    return {
      id: getGraphTabId(selection),
      tabTitle: `${stage.level}`,
      eyebrow: `${selection.discipline} · 단계 문서`,
      title: `${stage.level} · ${stage.title}`,
      summary: stage.summary,
      meta: [selection.discipline, `${stage.topics.length}개 주제`, "학습 단계"],
      sections: [
        {
          title: "이 단계에서 보는 것",
          body: [
            `${stage.level}에서는 ${stage.title}을 중심으로 개념의 구조를 잡습니다.`,
            stage.summary,
          ],
        },
        {
          title: "세부 주제",
          body: stage.topics.map((topic) => {
            const description =
              resolveBundledTopicByTitle(topic)?.summary ?? profile.topicDescriptions?.[topic];
            return description ? `${topic}: ${description}` : `${topic}을 먼저 살펴봅니다.`;
          }),
        },
        {
          title: "같이 가져갈 질문",
          body: profile.questions,
          kind: "questions",
        },
      ],
      related: [
        {
          label: `${selection.discipline} 개요`,
          selection: createDisciplineSelection(selection.discipline),
        },
        ...stage.topics.map((topic) => ({
          label: topic,
          selection: createTopicSelection(selection.discipline, stage.level, topic),
        })),
      ],
    };
  }

  const topicStage =
    findStageByTopic(selection.discipline, selection.topic) ??
    findDisciplineStage(selection.discipline, selection.stage);
  const bundledTopic = resolveBundledTopicByTitle(selection.topic);

  if (bundledTopic) {
    return buildBundledTopicDocument(selection, bundledTopic);
  }

  const topicDescription =
    profile.topicDescriptions?.[selection.topic] ??
    `${selection.topic}은 ${selection.discipline} 안에서 이어서 읽어야 할 주제입니다.`;
  const siblingTopics = (topicStage?.topics ?? []).filter((topic) => topic !== selection.topic);

  return {
    id: getGraphTabId(selection),
    tabTitle: selection.topic,
    eyebrow: `${selection.discipline} · 세부 주제`,
    title: selection.topic,
    summary: topicDescription,
    meta: [
      selection.discipline,
      topicStage ? `${topicStage.level} · ${topicStage.title}` : "세부 개념",
      "본문 노트",
    ],
    sections: [
      {
        title: "주제 설명",
        body: [topicDescription],
      },
      ...(topicStage
        ? [
            {
              title: "이 단계 안에서의 위치",
              body: [
                `${topicStage.level}는 ${topicStage.title} 단계이며, ${topicStage.summary}`,
                `이 주제는 ${topicStage.topics.join(", ")}와 함께 읽을 때 구조가 선명해집니다.`,
              ],
            },
          ]
        : []),
      {
        title: "생각해 볼 질문",
        body: profile.questions,
        kind: "questions",
      },
    ],
    related: [
      ...(topicStage
        ? [
            {
              label: `${topicStage.level} 돌아가기`,
              selection: createStageSelection(selection.discipline, topicStage.level),
            },
          ]
        : []),
      {
        label: `${selection.discipline} 개요`,
        selection: createDisciplineSelection(selection.discipline),
      },
      ...siblingTopics.slice(0, 4).map((topic) => ({
        label: topic,
        selection: createTopicSelection(
          selection.discipline,
          topicStage?.level ?? selection.stage,
          topic,
        ),
      })),
    ],
  };
}
