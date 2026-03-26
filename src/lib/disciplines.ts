export type DisciplineBranch = {
  id: string;
  label: string;
  disciplines: string[];
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
};

export type DisciplineStage = {
  level: string;
  title: string;
  summary: string;
  topics: string[];
};

export type DisciplineProfile = {
  summary: string;
  questions: string[];
  approaches: string[];
  stages?: DisciplineStage[];
  topicDescriptions?: Record<string, string>;
};

export const disciplineBranches: DisciplineBranch[] = [
  {
    id: "formal",
    label: "A. 형식 학문",
    disciplines: ["논리학", "수학", "통계학", "이론 전산학"],
    x: 980,
    y: 720,
    radiusX: 280,
    radiusY: 200,
  },
  {
    id: "natural",
    label: "B. 자연 학문",
    disciplines: ["물리학", "화학", "생물학", "지구과학", "천문학"],
    x: 1860,
    y: 560,
    radiusX: 340,
    radiusY: 240,
  },
  {
    id: "human-social",
    label: "C. 인간·사회 학문",
    disciplines: ["심리학", "언어학", "사회학", "경제학", "정치학", "법학", "인류학"],
    x: 2740,
    y: 1080,
    radiusX: 360,
    radiusY: 290,
  },
  {
    id: "humanities",
    label: "D. 인문 학문",
    disciplines: ["철학", "역사학", "문학", "종교학", "예술학"],
    x: 1160,
    y: 1710,
    radiusX: 340,
    radiusY: 260,
  },
  {
    id: "applied",
    label: "E. 응용·실천 학문",
    disciplines: ["공학", "의학", "경영학", "교육학", "디자인", "건축학"],
    x: 2820,
    y: 1760,
    radiusX: 360,
    radiusY: 260,
  },
];

export function findBranchByDiscipline(discipline: string) {
  return disciplineBranches.find((branch) => branch.disciplines.includes(discipline)) ?? null;
}

const branchProfileDefaults: Record<
  string,
  {
    summary: (discipline: string) => string;
    questions: string[];
    approaches: string[];
  }
> = {
  formal: {
    summary: (discipline) =>
      `${discipline}은 형식, 구조, 규칙, 추론의 타당성을 다루는 형식 학문입니다. 개념을 엄밀하게 정의하고, 증명과 계산 가능성으로 지식의 뼈대를 세웁니다.`,
    questions: [
      "어떤 규칙이 언제나 성립하는가",
      "복잡한 대상을 어떤 기호와 구조로 표현할 수 있는가",
      "증명 가능성과 계산 가능성의 경계는 어디인가",
    ],
    approaches: ["정의와 공리", "증명과 반례", "형식화와 계산 모델"],
  },
  natural: {
    summary: (discipline) =>
      `${discipline}은 자연 세계의 현상과 법칙을 관찰, 실험, 모형화로 탐구하는 자연 학문입니다. 설명과 예측을 동시에 강화하는 것이 핵심입니다.`,
    questions: [
      "이 현상은 어떤 원리로 작동하는가",
      "관측 가능한 패턴 뒤에 어떤 법칙이 있는가",
      "모형이 실제 세계를 얼마나 정확하게 설명하는가",
    ],
    approaches: ["관측과 측정", "실험과 검증", "이론 모형과 시뮬레이션"],
  },
  "human-social": {
    summary: (discipline) =>
      `${discipline}은 인간의 마음, 언어, 제도, 관계, 집단 행동을 다루는 인간·사회 학문입니다. 개인의 경험과 사회 구조를 함께 읽어내는 시선이 중요합니다.`,
    questions: [
      "인간은 왜 이런 방식으로 생각하고 행동하는가",
      "제도와 관계는 어떻게 형성되고 유지되는가",
      "개인과 사회 구조는 서로 어떻게 영향을 주는가",
    ],
    approaches: ["사례와 자료 분석", "질적·양적 연구", "비교와 해석"],
  },
  humanities: {
    summary: (discipline) =>
      `${discipline}은 인간이 남긴 의미, 해석, 가치, 표현을 탐구하는 인문 학문입니다. 텍스트와 맥락을 읽으며 세계를 이해하는 언어를 만듭니다.`,
    questions: [
      "우리는 무엇을 의미 있고 가치 있다고 여기는가",
      "사상과 작품은 어떤 맥락에서 태어났는가",
      "인간 경험을 해석하는 가장 설득력 있는 틀은 무엇인가",
    ],
    approaches: ["텍스트 읽기", "개념 분석", "역사적 맥락화"],
  },
  applied: {
    summary: (discipline) =>
      `${discipline}은 지식을 실제 문제 해결, 설계, 실행으로 연결하는 응용·실천 학문입니다. 이론을 현실 제약 속에서 작동 가능한 형태로 바꾸는 힘이 중요합니다.`,
    questions: [
      "이 문제를 실제로 어떻게 해결할 수 있는가",
      "현실 조건 속에서 무엇을 우선 설계해야 하는가",
      "효율성과 안전성, 경험을 어떻게 균형 있게 맞출 것인가",
    ],
    approaches: ["설계와 프로토타이핑", "의사결정과 운영", "평가와 개선"],
  },
};

const disciplineProfiles: Partial<Record<string, DisciplineProfile>> = {
  수학: {
    summary:
      "수학은 계산을 잘하는 기술이 아니라, 정의를 세우고 구조를 읽고 증명으로 관계를 확인하는 학문입니다. 아래 커리큘럼은 입문자가 길을 잃지 않도록 잡은 4단계 초안입니다.",
    questions: [
      "복잡한 현상을 가장 간결한 구조로 어떻게 표현할 수 있는가",
      "무엇이 항상 참인지, 어떤 조건에서만 참인지 어떻게 구분하는가",
      "문제를 계산 가능한 형태로 바꾸고 일반화할 수 있는가",
    ],
    approaches: ["정의-정리-증명 구조", "문제 풀이와 반례 탐색", "대수·해석·기하·확률 모델링"],
    stages: [
      {
        level: "1단계",
        title: "수학의 언어와 논증",
        summary:
          "수학을 읽고 쓰기 위한 최소 문법을 익히는 단계입니다. 정의를 읽는 법, 명제를 해석하는 법, 증명이 무엇인지 이해하는 감각을 먼저 세웁니다.",
        topics: ["집합", "명제", "논리", "함수", "증명 방식", "정의를 읽는 법"],
      },
      {
        level: "2단계",
        title: "계산과 대수의 구조",
        summary:
          "식을 다루고 패턴을 정리하는 단계입니다. 수 체계와 연산 규칙을 바탕으로 방정식, 수열, 행렬 같은 계산 가능한 구조를 다룹니다.",
        topics: ["수 체계", "식과 연산", "방정식과 부등식", "수열", "행렬과 벡터 기초"],
      },
      {
        level: "3단계",
        title: "변화와 공간 이해",
        summary:
          "현실의 변화와 형태를 수학적으로 읽는 단계입니다. 극한, 미분, 적분, 기하, 확률을 통해 움직임과 공간, 불확실성을 모델링합니다.",
        topics: ["극한", "미분", "적분", "기하", "확률과 통계"],
      },
      {
        level: "4단계",
        title: "추상 구조와 심화 증명",
        summary:
          "계산을 넘어 구조 그 자체를 연구하는 단계입니다. 여러 분야를 추상적으로 연결하고 정리와 증명을 더 긴 호흡으로 다룹니다.",
        topics: ["선형대수", "해석학", "추상대수", "이산수학", "수학적 모델링"],
      },
    ],
    topicDescriptions: {
      집합: "대상을 모으고 구분하는 가장 기본적인 언어입니다. 수학에서 무엇을 하나의 대상으로 볼지 정리하는 출발점이 됩니다.",
      명제: "참과 거짓을 판별할 수 있는 문장을 다룹니다. 이후 모든 정리와 증명은 결국 명제를 정확히 읽는 능력 위에 세워집니다.",
      논리: "명제가 어떤 규칙으로 연결되고 추론되는지 다룹니다. 조건문, 필요충분조건, 대우 같은 사고 도구가 여기에 들어갑니다.",
      함수: "한 대상을 다른 대상에 대응시키는 규칙을 다룹니다. 수학에서 관계와 변화를 표현하는 핵심 도구입니다.",
      "증명 방식": "직접증명, 대우증명, 귀류법처럼 명제가 왜 참인지 보이는 방법을 익힙니다. 수학적 설득의 문법을 배우는 단계입니다.",
      "정의를 읽는 법": "정의 안에서 조건과 결론을 분리해 읽고, 예시와 반례를 함께 떠올리는 습관을 기릅니다. 수학 텍스트를 해석하는 기본 기술입니다.",
      "수 체계": "자연수에서 실수까지 수의 확장을 이해합니다. 어떤 계산이 어디까지 가능한지 보는 틀을 제공합니다.",
      "식과 연산": "기호를 조작하고 식의 구조를 파악하는 훈련입니다. 이후 대수 전반을 다루는 기본 손놀림이 됩니다.",
      "방정식과 부등식": "조건을 만족하는 값을 찾고 비교하는 방법을 배웁니다. 문제를 수학적 형태로 번역하는 핵심 장면입니다.",
      수열: "값이 순서에 따라 어떻게 이어지는지 다룹니다. 패턴을 찾고 일반항을 세우는 사고를 길러줍니다.",
      "행렬과 벡터 기초": "수 하나가 아니라 여러 값을 한 번에 다루는 법을 익힙니다. 이후 선형대수와 데이터 표현의 기반이 됩니다.",
      극한: "값이 어떤 대상에 가까워질 때의 거동을 다룹니다. 미적분 전체를 이해하는 관문입니다.",
      미분: "변화율과 순간적인 기울기를 다룹니다. 움직임과 증감, 최적화를 읽는 핵심 도구입니다.",
      적분: "작은 변화를 누적해서 전체를 파악하는 방법입니다. 넓이, 양의 축적, 평균적 거동을 해석할 때 중요합니다.",
      기하: "도형, 거리, 각도, 공간 관계를 다룹니다. 시각적 구조를 논리적으로 읽는 힘을 길러줍니다.",
      "확률과 통계": "불확실성과 데이터 패턴을 다룹니다. 현실의 변동성을 수학적으로 해석하는 영역입니다.",
      선형대수: "벡터공간, 선형변환, 행렬을 통해 구조를 보는 분야입니다. 현대 수학과 공학 전반의 공용 언어에 가깝습니다.",
      해석학: "극한, 연속, 수렴 같은 개념을 엄밀하게 다룹니다. 미적분의 직관을 정교한 증명으로 바꾸는 단계입니다.",
      추상대수: "연산 구조를 일반화해서 군, 환, 체 같은 대상을 연구합니다. 수학의 패턴을 높은 수준에서 묶어줍니다.",
      이산수학: "연속이 아닌 구조와 관계를 다룹니다. 논리학, 조합론, 그래프 이론, 전산학과 긴밀하게 이어집니다.",
      "수학적 모델링": "현실 문제를 수학 구조로 번역하고 다시 해석하는 훈련입니다. 여러 수학 분야를 실제 문제에 연결하는 관문입니다.",
    },
  },
};

export function getDisciplineProfile(discipline: string): DisciplineProfile {
  const customProfile = disciplineProfiles[discipline];

  if (customProfile) {
    return customProfile;
  }

  const branch = findBranchByDiscipline(discipline);
  const fallback = branchProfileDefaults[branch?.id ?? "natural"] ?? branchProfileDefaults.natural;

  return {
    summary: fallback.summary(discipline),
    questions: fallback.questions,
    approaches: fallback.approaches,
  };
}

export function findDisciplineStage(discipline: string, level?: string | null) {
  const stages = getDisciplineProfile(discipline).stages ?? [];

  if (!stages.length) {
    return null;
  }

  return stages.find((stage) => stage.level === level) ?? stages[0] ?? null;
}

export function findStageByTopic(discipline: string, topic?: string | null) {
  if (!topic) {
    return null;
  }

  const stages = getDisciplineProfile(discipline).stages ?? [];
  return stages.find((stage) => stage.topics.includes(topic)) ?? null;
}

export function defaultDisciplineFromTopicCategory(category: string) {
  return (
    {
      천문학: "천문학",
      물리학: "물리학",
      역사: "역사학",
      과학사: "역사학",
      과학철학: "철학",
      정치철학: "정치학",
    }[category] ?? "천문학"
  );
}
