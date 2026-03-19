import type {
  GuidePreset,
  GuideRecommendation,
  LearningPath,
  Topic,
  Workspace,
} from "@/lib/domain";

export const topics: Topic[] = [
  {
    slug: "black-hole",
    title: "블랙홀",
    category: "천문학",
    summary: "빛조차 빠져나오기 어려울 만큼 시공간이 극단적으로 휘어진 영역",
    importance:
      "별의 진화, 중력, 시공간, 관측, 과학철학까지 한 번에 이어 주는 중심 Topic이다.",
    tags: ["우주", "상대성이론", "관측"],
    prerequisites: ["gravity", "spacetime", "general-relativity"],
    related: ["philosophy-of-science", "scientific-revolution"],
    crossDomainLinks: [
      {
        topicSlug: "scientific-revolution",
        label: "과학사",
        reason: "보이지 않는 대상을 이론과 관측으로 받아들이는 역사와 연결된다.",
      },
      {
        topicSlug: "philosophy-of-science",
        label: "과학철학",
        reason: "직접 보기 어려운 대상을 어떤 증거 체계로 검증하는지 묻게 만든다.",
      },
    ],
    layers: {
      light: {
        title: "3분 요약",
        description: "직관과 비유로 먼저 이해",
        body: [
          "블랙홀은 무언가를 빨아들이는 괴물이기보다 시공간이 너무 강하게 휘어진 결과에 가깝다.",
          "입문자는 블랙홀 자체보다 왜 중력이 공간을 휘게 만드는지부터 보면 훨씬 덜 막힌다.",
        ],
        keyIdeas: ["시공간 곡률", "사건의 지평선", "간접 관측"],
        bridgePrompt:
          "다음 단계에서는 일반상대성이론과 관측 증거를 같이 보는 편이 좋다.",
      },
      core: {
        title: "핵심 구조",
        description: "이론과 관측을 함께 묶기",
        body: [
          "일반상대성이론에서는 중력을 힘만이 아니라 시공간 구조의 변화로 본다. 블랙홀은 그 관점이 가장 극단적으로 드러나는 경우다.",
          "현대 천문학은 블랙홀을 직접 보기보다 주변 별의 운동, 강착 원반, 중력파 같은 간접 증거로 확인한다.",
        ],
        keyIdeas: ["중력의 재해석", "간접 증거", "형성 배경"],
        questions: [
          "블랙홀은 왜 직접 관측이 어려운가?",
          "이론과 관측은 어떻게 만나고 있는가?",
        ],
        bridgePrompt:
          "심화에서는 정보 역설과 과학철학적 해석까지 갈 수 있다.",
      },
      deep: {
        title: "심화",
        description: "이론 경계와 논쟁",
        body: [
          "심화 단계에서는 사건의 지평선, 특이점, 중력파, 정보 역설처럼 현대 물리학의 경계 문제들이 등장한다.",
          "이 시점의 블랙홀은 천문학 Topic이면서 동시에 이론 검증과 연구 설계의 Topic이 된다.",
        ],
        keyIdeas: ["정보 역설", "이론 검증", "연구 브리지"],
        bridgePrompt:
          "과학혁명과 과학철학으로 이동하면 지식이 만들어지는 방식이 더 잘 보인다.",
      },
    },
    sources: [
      {
        title: "Black Holes",
        type: "공공 기관",
        publisher: "NASA",
        url: "https://science.nasa.gov/universe/black-holes/",
        difficulty: "입문",
        trust: 5,
        summary: "블랙홀의 개념과 관측 사례를 빠르게 정리한다.",
      },
      {
        title: "Black hole",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/science/black-hole",
        difficulty: "입문-중급",
        trust: 4,
        summary: "역사와 개념을 한 번에 훑기 좋다.",
      },
    ],
  },
  {
    slug: "gravity",
    title: "중력",
    category: "물리학",
    summary: "질량과 에너지에 의해 물체가 끌리거나 시공간이 휘어지는 현상",
    importance:
      "블랙홀과 우주 Topic으로 들어가기 전에 가장 먼저 잡아야 하는 기본 개념이다.",
    tags: ["기초물리", "힘", "우주"],
    prerequisites: [],
    related: ["spacetime", "general-relativity", "black-hole"],
    crossDomainLinks: [
      {
        topicSlug: "scientific-revolution",
        label: "과학사",
        reason: "뉴턴 이후 중력 개념 변화는 과학혁명의 핵심 장면이다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "왜 떨어지고 왜 도는지 이해",
        body: [
          "가장 쉬운 수준에서는 중력을 물체들이 서로 끌어당기는 현상으로 보면 된다.",
          "하지만 우주 규모로 가면 중력은 단순한 힘 이상이 되고, 여기서 시공간 개념이 필요해진다.",
        ],
        keyIdeas: ["낙하", "궤도", "끌어당김"],
        bridgePrompt: "중력의 직관을 잡았다면 시공간으로 넘어갈 수 있다.",
      },
      core: {
        title: "핵심",
        description: "고전과 현대 설명의 차이",
        body: [
          "고전역학은 중력을 힘으로 설명하고, 상대론은 시공간 구조의 변화로 설명한다.",
          "같은 현상을 다른 언어로 보는 관점 전환이 핵심이다.",
        ],
        keyIdeas: ["뉴턴", "상대론", "설명 틀"],
        bridgePrompt:
          "블랙홀과 일반상대성이론에서 이 차이가 가장 선명해진다.",
      },
      deep: {
        title: "심화",
        description: "곡률과 중력파까지",
        body: [
          "심화 단계에서는 등가 원리, 시공간 곡률, 중력파 같은 개념이 등장한다.",
          "중력은 연구 단계로 갈수록 다른 기본 상호작용과의 관계까지 열어 준다.",
        ],
        keyIdeas: ["등가 원리", "중력파", "통합 문제"],
        bridgePrompt:
          "다음에는 일반상대성이론에서 중력이 어떻게 재해석되는지 보면 좋다.",
      },
    },
    sources: [
      {
        title: "Gravity",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/science/gravity-physics",
        difficulty: "입문",
        trust: 4,
        summary: "중력 개념의 역사와 기본을 요약한다.",
      },
      {
        title: "Gravity",
        type: "오픈 자료",
        publisher: "Einstein Online",
        url: "https://www.einstein-online.info/en/spotlight/gravity/",
        difficulty: "중급",
        trust: 4,
        summary: "상대론적 관점으로 이어지기 좋다.",
      },
    ],
  },
  {
    slug: "spacetime",
    title: "시공간",
    category: "물리학",
    summary: "공간과 시간을 하나의 구조로 다루는 현대 물리학의 핵심 개념",
    importance:
      "중력과 블랙홀을 단순 암기가 아니라 구조로 이해하게 만들어 주는 다리다.",
    tags: ["상대성이론", "우주", "기하학"],
    prerequisites: ["gravity"],
    related: ["general-relativity", "black-hole"],
    crossDomainLinks: [
      {
        topicSlug: "philosophy-of-science",
        label: "과학철학",
        reason: "공간과 시간 개념이 이론에 따라 어떻게 달라지는지 보여 준다.",
      },
    ],
    layers: {
      light: {
        title: "직관",
        description: "공간과 시간을 함께 보기",
        body: [
          "일상에서는 공간과 시간이 따로 느껴지지만 현대 물리학은 둘을 한 구조로 함께 다룬다.",
          "이 관점이 있어야 중력을 시공간의 성질로 이해하기 쉬워진다.",
        ],
        keyIdeas: ["공간+시간", "관점 전환", "구조"],
        bridgePrompt:
          "이제 일반상대성이론으로 이동하면 왜 시공간이 휘어진다고 말하는지 보인다.",
      },
      core: {
        title: "핵심",
        description: "상대론의 배경",
        body: [
          "특수상대성이론은 시간과 길이가 관찰자에 따라 달라질 수 있음을 보여 준다.",
          "일반상대성이론은 여기에 중력을 포함시켜 질량과 에너지가 시공간을 바꾼다고 설명한다.",
        ],
        keyIdeas: ["관찰자", "상대성", "곡률"],
        bridgePrompt:
          "블랙홀은 시공간 개념이 가장 극단적으로 드러나는 사례다.",
      },
      deep: {
        title: "심화",
        description: "기하학적 언어로 접근",
        body: [
          "심화 단계에서는 계량과 측지선 같은 표현이 중요해진다.",
          "이 수준에서는 시공간이 비유가 아니라 실제 설명 도구로 바뀐다.",
        ],
        keyIdeas: ["계량", "측지선", "기하학"],
        bridgePrompt:
          "일반상대성이론과 함께 보면 수학이 왜 필요한지 감이 잡힌다.",
      },
    },
    sources: [
      {
        title: "Spacetime",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/science/spacetime",
        difficulty: "입문",
        trust: 4,
        summary: "개념 배경을 짧게 정리한다.",
      },
      {
        title: "Space, Time and Relativity",
        type: "오픈 자료",
        publisher: "Einstein Online",
        url: "https://www.einstein-online.info/en/spotlight/time-space/",
        difficulty: "중급",
        trust: 4,
        summary: "상대론적 직관을 만드는 데 유용하다.",
      },
    ],
  },
  {
    slug: "general-relativity",
    title: "일반상대성이론",
    category: "물리학",
    summary:
      "질량과 에너지가 시공간을 휘게 만들고 그 곡률이 중력처럼 작동한다는 이론",
    importance:
      "블랙홀과 우주론을 이해하는 핵심 이론이며 과학철학과도 잘 연결된다.",
    tags: ["아인슈타인", "중력", "현대물리"],
    prerequisites: ["gravity", "spacetime"],
    related: ["black-hole", "scientific-revolution", "philosophy-of-science"],
    crossDomainLinks: [
      {
        topicSlug: "scientific-revolution",
        label: "과학사",
        reason: "이론 전환의 대표 사례로 읽을 수 있다.",
      },
      {
        topicSlug: "philosophy-of-science",
        label: "과학철학",
        reason: "이론과 검증 기준을 함께 묻게 만든다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "중력을 다르게 보는 법",
        body: [
          "중력을 끌어당김으로만 보지 않고 시공간 구조의 변화로 보는 관점이 핵심이다.",
          "무거운 물체가 시공간을 휘게 만들고 다른 물체는 그 구조를 따라 움직인다.",
        ],
        keyIdeas: ["중력 재해석", "시공간", "곡률"],
        bridgePrompt: "이 관점이 이해되면 블랙홀이 갑자기 낯설지 않다.",
      },
      core: {
        title: "핵심",
        description: "왜 필요한 이론인가",
        body: [
          "뉴턴의 설명이 강력하지만 모든 상황을 다 설명하지는 못한다.",
          "일반상대성이론은 정밀한 천문 관측과 극단적 질량 환경을 설명하는 데 필요하다.",
        ],
        keyIdeas: ["뉴턴의 한계", "예측 성공", "현대 우주론"],
        bridgePrompt: "관측 사례와 함께 보면 이론이 왜 신뢰를 얻는지 보인다.",
      },
      deep: {
        title: "심화",
        description: "검증과 이론의 경계",
        body: [
          "심화에서는 중력파, 블랙홀 해석, 이론과 실험의 관계가 중요해진다.",
          "이 Topic은 연구 모드에서 과학철학과 매우 강하게 연결된다.",
        ],
        keyIdeas: ["중력파", "검증", "설명력"],
        bridgePrompt: "다음으로 블랙홀과 과학철학을 묶어 보면 좋다.",
      },
    },
    sources: [
      {
        title: "General relativity",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/science/general-relativity",
        difficulty: "입문-중급",
        trust: 4,
        summary: "이론의 역사와 의미를 요약한다.",
      },
      {
        title: "General Relativity",
        type: "오픈 자료",
        publisher: "Einstein Online",
        url: "https://www.einstein-online.info/en/explandict/general-relativity/",
        difficulty: "중급",
        trust: 4,
        summary: "입문자에게도 비교적 친절하다.",
      },
    ],
  },
  {
    slug: "scientific-revolution",
    title: "과학혁명",
    category: "과학사",
    summary:
      "자연을 이해하는 방식이 관측, 실험, 수학 중심으로 재편된 역사적 전환",
    importance:
      "지식이 단지 쌓이는 것이 아니라 구조 자체가 바뀌는 과정을 보여 주는 브리지 Topic이다.",
    tags: ["역사", "근대", "이론 전환"],
    prerequisites: [],
    related: ["philosophy-of-science", "general-relativity"],
    crossDomainLinks: [
      {
        topicSlug: "black-hole",
        label: "천문학",
        reason: "현대 우주 개념은 과학혁명 이후의 도구와 이론 위에서 형성되었다.",
      },
      {
        topicSlug: "democracy",
        label: "정치철학",
        reason: "같은 근대 전환의 흐름 속에서 비교할 수 있다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "생각의 방식이 바뀐 사건",
        body: [
          "과학혁명은 몇 명의 천재 이야기보다 설명 기준 자체가 바뀌는 과정으로 보는 편이 정확하다.",
          "권위보다 관측과 수학적 서술이 더 중요해지는 전환이 핵심이다.",
        ],
        keyIdeas: ["관측", "수학화", "전환"],
        bridgePrompt:
          "과학철학으로 넘어가면 왜 어떤 설명이 더 과학적인지 묻게 된다.",
      },
      core: {
        title: "핵심",
        description: "지식 체계의 재배열",
        body: [
          "과학혁명은 이론, 도구, 검증 기준이 함께 이동하는 구조적 변화다.",
          "그래서 과학사는 현재의 지식을 외우는 일이 아니라 지식이 바뀌는 방식을 보는 일과 닿아 있다.",
        ],
        keyIdeas: ["도구와 이론", "검증 기준", "구조 변화"],
        bridgePrompt:
          "일반상대성이론을 함께 보면 과학혁명 이후에도 큰 전환이 반복된다는 점이 보인다.",
      },
      deep: {
        title: "심화",
        description: "역사와 철학이 만나는 곳",
        body: [
          "심화 단계에서는 과학혁명을 단일 사건으로 볼지, 느린 변화의 묶음으로 볼지에 대한 역사학 논의가 등장한다.",
          "이 지점에서 과학철학과 연결하면 패러다임 전환을 더 입체적으로 볼 수 있다.",
        ],
        keyIdeas: ["역사학 논의", "패러다임", "철학 연결"],
        bridgePrompt:
          "연구 모드에서는 과학철학과 묶어 읽는 것이 특히 유용하다.",
      },
    },
    sources: [
      {
        title: "Scientific Revolution",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/science/scientific-revolution",
        difficulty: "입문",
        trust: 4,
        summary: "범위와 핵심 의미를 빠르게 잡을 수 있다.",
      },
      {
        title: "Scientific Revolutions",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/scientific-revolutions/",
        difficulty: "심화",
        trust: 5,
        summary: "역사와 철학 관점에서 깊게 다룬다.",
      },
    ],
  },
  {
    slug: "philosophy-of-science",
    title: "과학철학",
    category: "과학철학",
    summary: "과학 지식이 무엇이며 어떻게 정당화되는지를 묻는 철학 분야",
    importance:
      "연구자 모드에서 이론, 증거, 모델, 검증을 구조화하는 중심 브리지다.",
    tags: ["철학", "검증", "연구"],
    prerequisites: ["scientific-revolution"],
    related: ["general-relativity", "black-hole", "scientific-revolution"],
    crossDomainLinks: [
      {
        topicSlug: "black-hole",
        label: "천문학",
        reason: "직접 보기 어려운 대상의 존재를 어떻게 받아들이는지 설명해 준다.",
      },
      {
        topicSlug: "democracy",
        label: "정치철학",
        reason: "정당화라는 문제를 다른 영역과 비교할 수 있다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "과학도 철학적 질문을 품고 있다",
        body: [
          "과학철학은 과학을 비판하기보다 과학이 어떤 근거로 지식을 만든다고 말하는지 살펴본다.",
          "좋은 설명은 무엇인지, 관측은 이론과 어떻게 연결되는지 같은 질문이 핵심이다.",
        ],
        keyIdeas: ["설명", "정당화", "검증"],
        bridgePrompt:
          "블랙홀이나 일반상대성이론과 연결하면 추상적 질문이 실제 사례로 바뀐다.",
      },
      core: {
        title: "핵심",
        description: "이론과 증거의 관계",
        body: [
          "데이터는 혼자 말하지 않고 이론적 틀 안에서 해석된다.",
          "좋은 연구는 결과뿐 아니라 어떤 모델과 가정 위에서 결과가 나왔는지도 함께 본다.",
        ],
        keyIdeas: ["이론 의존성", "모델", "해석"],
        bridgePrompt:
          "연구자 모드에서는 논문 읽기와 출처 정리의 중심축이 된다.",
      },
      deep: {
        title: "심화",
        description: "과학의 기준을 둘러싼 논쟁",
        body: [
          "심화 단계에서는 반증 가능성, 실재론, 패러다임 전환 같은 논점이 중요해진다.",
          "이때 블랙홀 사례를 다시 읽으면 과학철학이 추상이 아니라 해석 도구로 보인다.",
        ],
        keyIdeas: ["반증 가능성", "실재론", "패러다임"],
        bridgePrompt: "과학혁명과 함께 보면 지식 구조 변화가 더 선명해진다.",
      },
    },
    sources: [
      {
        title: "Philosophy of science",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/philosophy-of-science",
        difficulty: "입문",
        trust: 4,
        summary: "범위를 빠르게 훑기 좋다.",
      },
      {
        title: "Theory and Observation in Science",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/science-theory-observation/",
        difficulty: "심화",
        trust: 5,
        summary: "이론과 관측의 관계를 깊게 다룬다.",
      },
    ],
  },
  {
    slug: "french-revolution",
    title: "프랑스 혁명",
    category: "역사",
    summary: "근대 정치 질서와 시민 개념을 크게 흔든 역사적 사건",
    importance:
      "사건사에서 민주주의와 정치철학으로 이어지는 범용 구조를 검증하기 좋은 Topic이다.",
    tags: ["역사", "혁명", "근대"],
    prerequisites: [],
    related: ["democracy"],
    crossDomainLinks: [
      {
        topicSlug: "democracy",
        label: "정치철학",
        reason: "혁명은 민주주의 언어가 현실 정치에서 시험되는 장면이다.",
      },
      {
        topicSlug: "scientific-revolution",
        label: "과학사",
        reason: "같은 근대 전환의 흐름 속에서 비교할 수 있다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "왜 큰 전환점이 되었는가",
        body: [
          "프랑스 혁명은 왕을 몰아낸 사건이 아니라 권력과 시민의 관계를 다시 묻기 시작한 전환이다.",
          "입문 단계에서는 복잡한 연표보다 왜 근대 정치의 상징이 되었는지를 먼저 보는 편이 좋다.",
        ],
        keyIdeas: ["시민", "정치 전환", "근대"],
        bridgePrompt: "민주주의로 이동하면 사건이 개념으로 확장된다.",
      },
      core: {
        title: "핵심",
        description: "사건과 개념 함께 보기",
        body: [
          "혁명은 경제, 정치 구조, 계몽사상 같은 요소가 겹치며 전개되었다.",
          "중요한 것은 사건 단계보다 자유, 평등, 시민권이 어떻게 재구성되었는지다.",
        ],
        keyIdeas: ["계몽사상", "시민권", "정당성"],
        bridgePrompt: "민주주의와 묶어 보면 읽고 끝나지 않는다.",
      },
      deep: {
        title: "심화",
        description: "해석 경쟁",
        body: [
          "심화 단계에서는 혁명을 계급 갈등, 정치 문화, 국가 형성의 관점에서 다르게 읽는 역사학 논쟁이 등장한다.",
          "이 수준에서는 사건 자체보다 그것이 남긴 정치 언어를 함께 다루는 편이 중요하다.",
        ],
        keyIdeas: ["역사학 논쟁", "국민", "정치 언어"],
        bridgePrompt: "연구 모드에서는 민주주의와 함께 비교하는 편이 좋다.",
      },
    },
    sources: [
      {
        title: "French Revolution",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/event/French-Revolution",
        difficulty: "입문",
        trust: 4,
        summary: "사건 전개와 의미를 빠르게 정리한다.",
      },
      {
        title: "French Revolution",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/French_Revolution",
        difficulty: "입문",
        trust: 3,
        summary: "관련 Topic 확장에 유용하다.",
      },
    ],
  },
  {
    slug: "democracy",
    title: "민주주의",
    category: "정치철학",
    summary: "권력의 정당성이 시민의 참여와 동의에 기반해야 한다는 정치 원리",
    importance:
      "역사 사건과 철학 개념을 연결해 주는 대표적인 브리지 Topic이다.",
    tags: ["정치", "시민", "정당성"],
    prerequisites: ["french-revolution"],
    related: ["french-revolution", "philosophy-of-science"],
    crossDomainLinks: [
      {
        topicSlug: "french-revolution",
        label: "역사",
        reason: "민주주의 개념이 현실 정치에서 어떤 긴장을 겪는지 보여 준다.",
      },
      {
        topicSlug: "philosophy-of-science",
        label: "철학",
        reason: "정당화라는 문제를 다른 방식으로 비교하게 만든다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "제도보다 원리로 보기",
        body: [
          "민주주의는 선거 제도만이 아니라 권력이 누구에게서 나오고 어떻게 정당화되는지를 묻는 원리다.",
          "다수결보다 시민 참여, 책임성, 권력 제한을 함께 봐야 더 정확하다.",
        ],
        keyIdeas: ["참여", "책임성", "정당성"],
        bridgePrompt:
          "프랑스 혁명과 함께 보면 민주주의 언어가 어떻게 형성되는지 보인다.",
      },
      core: {
        title: "핵심",
        description: "원리와 제도의 연결",
        body: [
          "민주주의는 시민권, 대표제, 법치 같은 제도와 연결되지만 그 바탕에는 동의의 문제가 있다.",
          "그래서 민주주의는 정치 제도론이면서 동시에 철학적 Topic이기도 하다.",
        ],
        keyIdeas: ["동의", "대표제", "법치"],
        bridgePrompt: "심화로 갈수록 자유와 평등의 긴장을 같이 봐야 한다.",
      },
      deep: {
        title: "심화",
        description: "민주주의의 내부 긴장",
        body: [
          "심화 단계에서는 자유와 평등, 다수결과 소수자 보호, 숙의와 효율성의 긴장을 다룬다.",
          "연구 모드에서는 민주주의를 하나의 정답이 아니라 경쟁하는 모델들의 묶음으로 보는 편이 좋다.",
        ],
        keyIdeas: ["자유와 평등", "소수자 보호", "경쟁 모델"],
        bridgePrompt: "역사 사례와 왕복하면 추상과 현실이 분리되지 않는다.",
      },
    },
    sources: [
      {
        title: "Democracy",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/democracy",
        difficulty: "입문",
        trust: 4,
        summary: "민주주의 개념과 전개를 넓게 정리한다.",
      },
      {
        title: "Democracy",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/democracy/",
        difficulty: "심화",
        trust: 5,
        summary: "철학적 논점을 체계적으로 다룬다.",
      },
    ],
  },
];

export const featuredTopicSlugs = [
  "black-hole",
  "french-revolution",
  "scientific-revolution",
  "philosophy-of-science",
];

export const guidePresets: GuidePreset[] = [
  {
    id: "black-hole",
    label: "블랙홀 입문",
    query: "나는 수학 거의 모르는데 블랙홀 이해하고 싶음",
  },
  {
    id: "french-revolution",
    label: "프랑스 혁명에서 정치철학",
    query: "프랑스 혁명을 교양 수준으로 시작해서 정치철학까지 연결하고 싶음",
  },
  {
    id: "science",
    label: "과학사에서 연구 구조",
    query: "과학혁명을 가볍게 이해하고 과학철학과 현대 물리학으로 확장하고 싶음",
  },
];

export const samplePaths: LearningPath[] = [
  {
    slug: "black-hole",
    title: "블랙홀 입문에서 연구 브리지까지",
    goal: "직관에서 시작해 이론과 검증의 문제로 이동하기",
    startTopicSlug: "gravity",
    currentTopicSlug: "black-hole",
    nextTopicSlugs: ["philosophy-of-science", "scientific-revolution"],
    steps: [
      {
        topicSlug: "gravity",
        depth: "light",
        status: "completed",
        note: "중력의 직관을 먼저 잡는다.",
      },
      {
        topicSlug: "spacetime",
        depth: "core",
        status: "completed",
        note: "시공간 관점으로 전환한다.",
      },
      {
        topicSlug: "general-relativity",
        depth: "light",
        status: "completed",
        note: "중력을 곡률로 재해석한다.",
      },
      {
        topicSlug: "black-hole",
        depth: "light",
        status: "current",
        note: "현재 이해의 중심 Topic",
      },
      {
        topicSlug: "philosophy-of-science",
        depth: "core",
        status: "suggested",
        note: "이론과 증거의 관계를 다시 본다.",
      },
    ],
  },
  {
    slug: "french-revolution",
    title: "프랑스 혁명에서 민주주의까지",
    goal: "사건사에서 정치 개념으로 이동하기",
    startTopicSlug: "french-revolution",
    currentTopicSlug: "french-revolution",
    nextTopicSlugs: ["democracy"],
    steps: [
      {
        topicSlug: "french-revolution",
        depth: "light",
        status: "current",
        note: "근대 정치의 전환점부터 이해한다.",
      },
      {
        topicSlug: "democracy",
        depth: "light",
        status: "suggested",
        note: "혁명이 남긴 개념적 언어로 확장한다.",
      },
    ],
  },
];

export const workspaces: Workspace[] = [
  {
    slug: "black-hole-bridge",
    title: "블랙홀을 이해하는 연구 브리지",
    mode: "연구자 모드",
    focusQuestion:
      "블랙홀은 어떻게 이론, 관측, 철학적 검토가 함께 필요한 Topic이 되는가?",
    relatedDomains: ["천문학", "물리학", "과학사", "과학철학"],
    questionList: [
      "블랙홀의 존재를 강하게 지지하는 관측 증거는 무엇인가?",
      "일반상대성이론의 어떤 요소가 사건의 지평선을 설명하는가?",
      "직접 보기 어려운 대상을 과학적으로 받아들이는 기준은 무엇인가?",
    ],
    debateMap: [
      {
        title: "정보 역설",
        detail: "블랙홀 증발과 정보 보존을 어떻게 함께 설명할 것인가",
      },
      {
        title: "관측과 해석",
        detail: "이미지와 데이터는 어디까지 직접 관측이고 어디부터 모델 해석인가",
      },
      {
        title: "이론의 경계",
        detail: "일반상대성이론과 양자이론이 만나는 지점에서 무엇이 남는가",
      },
    ],
    savedTopicSlugs: [
      "black-hole",
      "general-relativity",
      "scientific-revolution",
      "philosophy-of-science",
    ],
    savedSources: [
      {
        title: "Black Holes",
        publisher: "NASA",
        type: "공공 기관",
        note: "입문 기준 자료",
      },
      {
        title: "Scientific Revolutions",
        publisher: "Stanford Encyclopedia of Philosophy",
        type: "철학 자료",
        note: "이론 변화 프레임 정리",
      },
      {
        title: "General Relativity",
        publisher: "Einstein Online",
        type: "오픈 자료",
        note: "개념 연결용 참고",
      },
    ],
    noteBlocks: [
      "연구 모드에서는 블랙홀을 사실 요약이 아니라 이론, 관측, 검증의 세 층으로 나누는 편이 좋다.",
      "과학철학 브리지는 부가 기능이 아니라 연구 구조화의 핵심 축이다.",
      "같은 Topic 구조 위에서 학습자 모드와 연구자 모드가 달라지도록 설계해야 한다.",
    ],
  },
];

export const defaultGuideRecommendation: GuideRecommendation = {
  title: "범용 시작 경로",
  summary: "하나의 Topic에서 다른 분야로 확장하는 기본 경로",
  recommendedDepth: "light",
  startTopicSlug: "black-hole",
  path: ["black-hole", "philosophy-of-science", "scientific-revolution"],
  bridges: ["french-revolution", "democracy"],
  reasons: [
    "처음에는 중심 Topic 하나를 잡고 Light에서 Core로 올라가는 흐름이 중요하다.",
    "그다음 related와 cross-domain 브리지를 통해 탐험을 이어가는 편이 좋다.",
  ],
};
