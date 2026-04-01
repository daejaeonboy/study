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
    slug: "set",
    title: "집합",
    category: "수학",
    summary: "대상을 모아 하나의 수학적 대상으로 다루는 가장 기본적인 언어",
    importance:
      "수학 입문에서 집합은 계산보다 먼저 배워야 하는 공용 문법이다. 무엇을 대상으로 삼는지, 같은 것과 다른 것을 어떻게 구분하는지, 조건으로 대상을 모은다는 말이 무엇인지가 여기서 정리된다.",
    tags: ["수학", "기초", "표기"],
    prerequisites: ["reading-definitions"],
    related: ["proposition", "logic", "function"],
    crossDomainLinks: [
      {
        topicSlug: "function",
        label: "함수",
        reason: "함수는 결국 집합 사이의 대응으로 읽을 때 가장 정확해진다.",
      },
      {
        topicSlug: "proof-methods",
        label: "증명 방식",
        reason: "집합 포함 관계와 원소 조건은 많은 증명의 기본 재료가 된다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "집합이 무엇을 하는 언어인지 이해하기",
        body: [
          "집합은 여러 대상을 한 덩어리로 묶어 다루는 방법이다. 하지만 일상에서 그냥 모아 놓은 목록과 달리, 수학의 집합은 어떤 대상이 들어가고 어떤 대상이 들어가지 않는지가 분명해야 한다. 기준이 분명하지 않으면 집합이라고 부르기 어렵다.",
          "예를 들어 자연수 전체의 집합, 10 이하의 짝수 집합, 어떤 반 학생들의 집합처럼 대상을 조건에 따라 모을 수 있다. 여기서 중요한 것은 순서가 아니라 포함 여부다. 집합에서는 원소가 무엇인지가 중요하지, 먼저 썼는지 나중에 썼는지는 중요하지 않다.",
          "그래서 `{1, 2, 3}`과 `{3, 2, 1}`은 같은 집합이다. 집합이 같다는 말은 겉모양이 같다는 뜻이 아니라, 들어 있는 원소가 완전히 같다는 뜻이다. 반대로 원소 하나라도 다르면 다른 집합이다.",
          "입문 단계에서는 기호보다 의미를 먼저 잡는 편이 좋다. `a ∈ A`는 a가 집합 A에 속한다는 뜻이고, `a ∉ A`는 속하지 않는다는 뜻이다. 또 아무 원소도 가지지 않는 집합은 공집합이라 하고 `∅`로 쓴다. 공집합은 '아무것도 아닌 것'이 아니라, 원소가 하나도 없다는 조건을 가진 하나의 집합이다.",
        ],
        keyIdeas: ["원소", "부분집합", "공집합", "조건으로 모으기"],
        questions: [
          "집합은 단순 목록과 무엇이 다른가요?",
          "원소와 부분집합을 왜 엄밀히 구분해야 하나요?",
        ],
        bridgePrompt:
          "다음에는 명제로 넘어가 집합에 대한 문장을 참과 거짓으로 읽는 법을 익히면 좋다.",
      },
      core: {
        title: "핵심",
        description: "원소 조건과 연산을 정확히 읽기",
        body: [
          "집합을 공부할 때 가장 먼저 익혀야 할 것은 집합 기호를 문장으로 다시 읽는 습관이다. `x ∈ A∩B`는 x가 A에도 들어 있고 B에도 들어 있다는 뜻이고, `x ∈ A∪B`는 둘 중 적어도 하나에는 들어 있다는 뜻이다. 결국 집합 연산은 기호 조작이 아니라 조건 해석이다.",
          "합집합은 조건을 넓히는 연산이고, 교집합은 조건을 동시에 만족시키는 연산이며, 차집합은 한쪽에는 들어 있지만 다른 쪽에는 들어 있지 않다는 조건을 표현한다. 그래서 벤다이어그램은 편리한 그림이지만, 최종적으로는 언제나 '임의의 x를 잡았을 때 무엇이 참인가'로 다시 읽을 수 있어야 한다.",
          "부분집합도 같은 방식으로 읽는다. `A ⊂ B` 또는 `A ⊆ B`라는 말은 A의 모든 원소가 B에도 들어 있다는 뜻이다. 따라서 부분집합을 확인할 때는 집합 전체를 통째로 비교하는 것이 아니라, A 안의 임의의 원소 하나를 잡아 B에도 속하는지 보는 것이 표준적인 사고 방식이다.",
          "초보자가 자주 하는 실수는 원소와 집합 자체를 섞는 것이다. 예를 들어 `1 ⊂ A`는 보통 틀린 표현이고, `1 ∈ A` 또는 `{1} ⊂ A`처럼 무엇이 원소이고 무엇이 집합인지 구분해야 한다. 숫자 1과 원소 하나를 가진 집합 `{1}`은 전혀 다른 대상이다.",
          "또 하나 중요한 것은 조건으로 정의한 집합을 읽는 법이다. 예를 들어 `{x | x는 10 이하의 짝수}`는 'x가 10 이하이고 짝수인 모든 x의 집합'이라는 뜻이다. 이런 표기를 볼 때는 막연히 기호로 보지 말고, 어떤 조건을 만족하는 대상만 모은다는 뜻으로 풀어 읽어야 한다.",
        ],
        keyIdeas: ["합집합", "교집합", "차집합", "원소와 집합의 구분"],
        questions: [
          "집합 연산을 계산처럼 외우면 왜 금방 막히나요?",
          "집합 문제를 풀 때 벤다이어그램과 문장 해석은 어떻게 연결되나요?",
        ],
        bridgePrompt:
          "정의를 읽는 법과 함께 보면 기호를 문장으로 번역하는 감각이 더 빨리 잡힌다.",
      },
      deep: {
        title: "심화",
        description: "증명과 함수의 바닥 구조로 보기",
        body: [
          "심화 단계에서는 집합이 단순 기초 단원이 아니라 이후 수학 전체의 공용 바닥이라는 점이 보인다. 함수는 집합 사이의 대응으로 정의되고, 관계도 결국 어떤 집합 위에서 성립하는 조건으로 표현된다. 나중에 선형대수, 해석학, 확률로 가더라도 결국 대상들을 어떤 집합으로 보고 어떤 조건을 붙이는지가 계속 반복된다.",
          "집합은 증명 훈련에도 매우 좋다. 예를 들어 `A ⊆ B`를 보이려면 A의 임의의 원소 x를 하나 잡고, x가 A에 속한다고 가정했을 때 왜 B에도 속하는지 설명하면 된다. 반대로 두 집합이 같음을 보이려면 `A ⊆ B`와 `B ⊆ A` 두 방향을 각각 보여야 한다. 이 과정은 수학에서 정의를 실제 논증 첫 줄로 옮기는 가장 표준적인 연습이다.",
          "또 집합을 깊게 이해하면 반례를 찾는 감각도 좋아진다. 어떤 명제가 거짓일 때는 그 명제를 깨는 원소 하나를 찾거나, 포함 관계가 깨지는 지점을 찾으면 된다. 그래서 집합 언어는 문제를 추상적으로 만들기만 하는 것이 아니라, 오히려 어디를 확인하면 되는지 더 선명하게 보여 주는 도구다.",
          "즉 집합을 잘 안다는 것은 기호를 많이 아는 것이 아니라, 수학 문장을 '대상', '속함', '포함', '조건'의 언어로 다시 써서 이해할 수 있다는 뜻이다. 이 힘이 생기면 이후 수학이 갑자기 계산 문제가 아니라 구조를 읽는 학문으로 보이기 시작한다.",
        ],
        keyIdeas: ["임의의 원소 잡기", "포함 관계 증명", "구조의 바닥 언어"],
        questions: [
          "부분집합 증명은 왜 임의의 원소를 잡는 방식으로 진행되나요?",
          "집합 언어가 함수와 증명의 바닥이 된다는 말은 구체적으로 무엇인가요?",
        ],
        bridgePrompt:
          "이제 명제와 논리로 넘어가 집합 조건을 참과 거짓의 구조로 읽는 법을 붙이면 훨씬 강해진다.",
      },
    },
    sources: [
      {
        title: "Set (mathematics)",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Set_(mathematics)",
        difficulty: "입문",
        trust: 3,
        summary: "원소, 부분집합, 연산 같은 기본 개념의 윤곽을 빠르게 확인할 수 있다.",
      },
      {
        title: "Sets - Introduction",
        type: "오픈 자료",
        publisher: "Math is Fun",
        url: "https://www.mathsisfun.com/sets/sets-introduction.html",
        difficulty: "입문",
        trust: 4,
        summary: "처음 보는 학생이 집합 기호를 직관적으로 익히기에 좋다.",
      },
    ],
  },
  {
    slug: "reading-definitions",
    title: "정의를 읽는 법",
    category: "수학",
    summary: "정의 속 조건과 결론을 분리해 읽고 예시와 반례로 점검하는 기본 기술",
    importance:
      "수학에서 막히는 이유의 상당수는 계산 부족이 아니라 정의를 대충 읽기 때문이다. 정의를 체크리스트처럼 읽을 수 있어야 집합, 함수, 증명, 정리 풀이가 전부 쉬워진다.",
    tags: ["수학", "독해", "정의"],
    prerequisites: [],
    related: ["set", "proposition", "proof-methods"],
    crossDomainLinks: [
      {
        topicSlug: "set",
        label: "집합",
        reason: "집합 기호는 결국 정의를 문장으로 번역해 읽는 연습에서 출발한다.",
      },
      {
        topicSlug: "proof-methods",
        label: "증명 방식",
        reason: "증명은 대부분 정의를 정확히 펼쳐 쓰는 데서 시작된다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "정의를 문장으로 분해해 보기",
        body: [
          "정의를 읽는 가장 좋은 첫 습관은 한 문장 전체를 통째로 외우려 하지 않고, '무엇을 가정하고 무엇을 결론으로 삼는가'를 먼저 나누는 것이다.",
          "예를 들어 짝수의 정의를 보면 `어떤 정수 n이 있을 때 x=2n으로 쓸 수 있다`처럼 조건과 표현 방식이 함께 들어 있다. 여기서 중요한 것은 '2로 나누어진다'는 느낌이 아니라 정확히 어떤 형태로 쓸 수 있느냐이다.",
          "입문 단계에서는 정의를 볼 때 반드시 예시 하나와 반례 하나를 같이 떠올리는 습관을 들이면 좋다. 그래야 정의가 암기 문장이 아니라 경계가 있는 규칙으로 보이기 시작한다.",
        ],
        keyIdeas: ["조건", "결론", "예시", "반례"],
        questions: [
          "정의를 예시와 반례로 같이 보는 이유는 무엇인가요?",
          "정의 문장을 통째로 외우는 것과 분해해서 읽는 것은 무엇이 다른가요?",
        ],
        bridgePrompt:
          "다음에는 명제로 넘어가 정의가 어떤 문장을 참으로 만드는지 읽는 법을 붙이면 좋다.",
      },
      core: {
        title: "핵심",
        description: "정의를 체크리스트처럼 사용하는 법",
        body: [
          "정의를 제대로 읽는다는 것은 문제를 볼 때 '이 대상이 정의의 모든 조건을 만족하는가'를 하나씩 체크할 수 있다는 뜻이다. 수학에서 많은 오류는 조건 하나를 빼먹거나 다른 정의와 섞어 읽는 데서 나온다.",
          "특히 `모든`, `어떤`, `오직`, `필요`, `충분` 같은 표현은 대충 지나가면 안 된다. 이런 말은 정의의 구조를 바꾸고, 나중에 증명에서 어느 방향이 쉬운지까지 결정한다.",
          "좋은 독해 습관은 정의를 다시 자기 말로 쓰는 것이다. 원문 기호를 문장으로 풀고, 그 문장을 다시 짧은 체크리스트로 줄이면 문제 풀이에서 바로 쓸 수 있는 형태가 된다.",
        ],
        keyIdeas: ["체크리스트화", "양화사", "필요조건과 충분조건", "재서술"],
        questions: [
          "정의를 체크리스트화하면 실제 풀이에서 무엇이 쉬워지나요?",
          "모든/어떤 같은 표현을 놓치면 왜 논리가 무너지나요?",
        ],
        bridgePrompt:
          "집합과 함수 정의를 직접 체크리스트로 바꾸어 보면 가장 효과가 크다.",
      },
      deep: {
        title: "심화",
        description: "정의의 부정과 증명 연결",
        body: [
          "심화 단계에서는 정의의 부정을 정확히 쓸 수 있어야 한다. 어떤 정의가 성립하지 않는다는 말을 하려면, 무엇이 실패하는지 구체적으로 써야 하기 때문이다.",
          "예를 들어 함수 정의를 부정할 때는 '어떤 입력에서 출력이 두 개 이상 나온다'처럼 위반되는 조건을 명시해야 한다. 이런 감각이 있으면 반례를 찾는 속도가 크게 빨라진다.",
          "결국 정의를 읽는 법은 별도 부록이 아니라 증명의 시작점이다. 정의를 펼치고, 필요한 조건을 확인하고, 부정을 만들고, 예시와 반례를 비교하는 흐름 자체가 수학적 사고의 기초다.",
        ],
        keyIdeas: ["정의의 부정", "반례 설계", "증명의 출발점"],
        questions: [
          "정의를 부정할 때 왜 막연한 설명이 아니라 구조를 써야 하나요?",
          "정의 독해가 곧 증명 준비라는 말은 구체적으로 무엇을 뜻하나요?",
        ],
        bridgePrompt:
          "증명 방식으로 넘어가면 정의를 어떻게 실제 논증 첫 줄에 올리는지 볼 수 있다.",
      },
    },
    sources: [
      {
        title: "Definition",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Definition",
        difficulty: "입문",
        trust: 3,
        summary: "정의가 무엇을 하는 도구인지 일반적인 감각을 잡는 데 쓸 수 있다.",
      },
      {
        title: "Mathematical proof",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Mathematical_proof",
        difficulty: "입문-중급",
        trust: 3,
        summary: "정의와 증명이 실제로 어떻게 이어지는지 큰 그림을 보는 데 도움 된다.",
      },
    ],
  },
  {
    slug: "proposition",
    title: "명제",
    category: "수학",
    summary: "참과 거짓을 분명히 판별할 수 있는 문장을 다루는 수학의 기본 단위",
    importance:
      "수학에서 정리와 증명은 결국 명제를 다루는 일이다. 무엇이 주장이고 무엇이 아직 조건일 뿐인지 구분하지 못하면 아무 문제도 제대로 읽기 어렵다.",
    tags: ["수학", "논리", "문장"],
    prerequisites: ["reading-definitions"],
    related: ["logic", "proof-methods", "set"],
    crossDomainLinks: [
      {
        topicSlug: "logic",
        label: "논리",
        reason: "명제가 연결되는 규칙을 배우면 참과 거짓 구조가 훨씬 선명해진다.",
      },
      {
        topicSlug: "proof-methods",
        label: "증명 방식",
        reason: "증명은 결국 하나의 명제가 왜 참인지 보이는 과정이다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "무엇이 명제이고 무엇이 아닌지 구분하기",
        body: [
          "명제는 참이거나 거짓인 문장이다. 여기서 중요한 것은 '정답을 알고 있느냐'가 아니라, 원리상 참과 거짓이 분명히 정해질 수 있느냐이다.",
          "예를 들어 `2는 짝수이다`는 명제이지만 `x는 짝수이다`는 그대로는 명제가 아니다. x가 무엇인지 정해지지 않았기 때문이다. 또한 `이 수는 아름답다`처럼 기준이 흐린 문장도 보통 명제로 취급하지 않는다.",
          "입문자는 문제를 볼 때 먼저 어떤 문장이 명제인지, 어떤 문장이 아직 조건이 덜 붙은 표현인지 가려내는 훈련을 해야 한다. 이게 안 되면 논리와 증명도 바로 흐려진다.",
        ],
        keyIdeas: ["참과 거짓", "열린 문장", "조건 확정"],
        questions: [
          "왜 `x는 짝수이다`는 그대로 명제가 아닌가요?",
          "명제는 답을 아는 문장과 무엇이 다른가요?",
        ],
        bridgePrompt:
          "다음에는 논리로 넘어가 명제들이 어떻게 서로 연결되는지 보는 것이 좋다.",
      },
      core: {
        title: "핵심",
        description: "조건문과 필요한 말 구분하기",
        body: [
          "명제를 읽을 때 가장 자주 만나는 형태는 조건문이다. `P이면 Q이다`라는 문장은 가정과 결론을 함께 가진 명제이며, 증명에서도 이 구조가 매우 자주 등장한다.",
          "여기서 자주 헷갈리는 것이 역, 이, 대우다. 원래 명제와 역은 일반적으로 같지 않지만, 대우는 원래 명제와 동치다. 이 차이를 정확히 이해해야 필요조건과 충분조건을 잘못 읽지 않는다.",
          "예를 들어 `x가 4의 배수이면 짝수이다`는 참이지만, 그 역인 `짝수이면 4의 배수이다`는 거짓이다. 이런 간단한 예시를 직접 만들어 보는 것이 명제를 체감하는 가장 좋은 방법이다.",
        ],
        keyIdeas: ["조건문", "역", "이", "대우", "필요조건과 충분조건"],
        questions: [
          "대우는 왜 원래 명제와 같은 정보를 가지나요?",
          "역과 대우를 헷갈리면 실제 증명에서 어떤 실수를 하나요?",
        ],
        bridgePrompt:
          "증명 방식과 함께 보면 어떤 명제에서 대우증명이 자연스러운지 감이 생긴다.",
      },
      deep: {
        title: "심화",
        description: "양화사와 정리 독해 연결",
        body: [
          "심화 단계에서는 명제가 `모든 x에 대해`, `어떤 x가 존재하여` 같은 양화사와 결합한다. 이때 문장의 참거짓은 특정 숫자 하나가 아니라 전체 대상 범위를 어떻게 다루느냐에 달려 있다.",
          "수학 정리를 읽을 때는 양화사를 숨겨 놓고 쓰는 경우가 많다. 그래서 정리 한 줄을 보면 '어떤 대상을 임의로 잡는지', '무엇이 존재한다고 말하는지'를 스스로 복원해 내야 한다.",
          "명제를 깊게 공부한다는 것은 논리 퍼즐을 푸는 것이 아니라, 정리 문장을 해석 가능한 구조로 바꾸는 힘을 기르는 일이다.",
        ],
        keyIdeas: ["양화사", "임의", "존재", "정리 독해"],
        questions: [
          "양화사를 복원해서 읽는 습관이 왜 중요한가요?",
          "정리 문장을 명제 구조로 바꾸면 무엇이 쉬워지나요?",
        ],
        bridgePrompt:
          "논리와 정의 독해를 같이 붙이면 정리 한 줄을 훨씬 천천히 정확하게 읽을 수 있다.",
      },
    },
    sources: [
      {
        title: "Statement (logic)",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Statement_(logic)",
        difficulty: "입문",
        trust: 3,
        summary: "명제와 열린 문장의 차이를 빠르게 확인할 수 있다.",
      },
      {
        title: "Propositional calculus",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Propositional_calculus",
        difficulty: "중급",
        trust: 3,
        summary: "명제가 논리 체계 안에서 어떻게 다뤄지는지 큰 그림을 보여 준다.",
      },
    ],
  },
  {
    slug: "logic",
    title: "논리",
    category: "수학",
    summary: "명제가 어떤 규칙으로 연결되고 추론되는지를 다루는 사고 도구",
    importance:
      "논리는 수학 전체의 운영체제에 가깝다. 풀이에서 왜 그 다음 줄로 넘어갈 수 있는지, 어떤 반례가 명제를 깨는지, 어떤 경우를 나누어야 하는지가 여기서 정리된다.",
    tags: ["수학", "추론", "조건문"],
    prerequisites: ["proposition"],
    related: ["proof-methods", "set", "function"],
    crossDomainLinks: [
      {
        topicSlug: "proof-methods",
        label: "증명 방식",
        reason: "증명 방법 선택은 결국 명제 구조를 어떻게 읽는지에 달려 있다.",
      },
      {
        topicSlug: "function",
        label: "함수",
        reason: "함수 정의도 전부 조건과 결론, 임의와 존재의 논리로 읽힌다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "그리고, 또는, 아니다를 정확히 쓰기",
        body: [
          "논리 입문은 거창한 기호보다 일상 언어를 정확히 읽는 데서 시작한다. `그리고`, `또는`, `아니다`가 수학 문장 안에서 어떻게 작동하는지부터 분명히 잡아야 한다.",
          "특히 수학의 `또는`은 보통 둘 중 하나만이 아니라 둘 다 가능한 포함적 의미로 쓰인다. 이런 작은 차이를 놓치면 조건 해석과 반례 찾기가 계속 어긋난다.",
          "입문 단계에서는 짧은 문장을 기호로 바꾸기보다, 기호를 다시 자연어로 설명하는 연습이 더 중요하다. 그래야 논리가 계산이 아니라 해석 도구가 된다.",
        ],
        keyIdeas: ["그리고", "또는", "아니다", "조건 해석"],
        questions: [
          "수학에서 `또는`은 왜 일상 언어와 다르게 느껴지나요?",
          "논리를 기호가 아니라 해석 도구로 읽는다는 말은 무엇인가요?",
        ],
        bridgePrompt:
          "명제와 함께 보면 조건문과 부정문을 훨씬 덜 헷갈리게 읽을 수 있다.",
      },
      core: {
        title: "핵심",
        description: "조건문, 동치, 경우 나누기",
        body: [
          "논리의 핵심은 조건문을 잘 다루는 데 있다. 어떤 가정에서 어떤 결론이 나오는지 읽고, 필요하면 대우로 바꿔 보는 것만으로도 많은 증명이 쉬워진다.",
          "또 동치라는 개념은 양방향 증명이 필요하다는 뜻이다. 따라서 `A이면 B`와 `A일 필요충분조건은 B`를 구분하지 못하면 증명 구조도 흐려진다.",
          "경우 나누기는 논리적 분할이다. 가능한 경우들을 빠짐없이 나누고 서로 겹치지 않게 정리해야 한다. 이 감각은 절댓값, 부등식, 함수 정의역 같은 곳에서 반복해서 필요하다.",
        ],
        keyIdeas: ["조건문", "동치", "대우", "경우 나누기"],
        questions: [
          "왜 어떤 문제는 직접증명보다 대우증명이 더 자연스러운가요?",
          "경우 나누기에서 가장 흔한 오류는 무엇인가요?",
        ],
        bridgePrompt:
          "증명 방식으로 가면 논리가 실제 풀이 전략으로 어떻게 바뀌는지 볼 수 있다.",
      },
      deep: {
        title: "심화",
        description: "양화사와 부정의 정교한 사용",
        body: [
          "심화 단계에서는 논리의 어려움이 부정과 양화사에서 본격적으로 드러난다. `모든 x에 대해`의 부정은 `어떤 x가 존재하여 ... 아니다`가 되고, `존재한다`의 부정은 `모든 경우에 성립하지 않는다`로 바뀐다.",
          "이 변환을 정확히 다룰 수 있어야 반례를 만들고, 존재 명제를 증명하거나 부정 명제를 읽을 수 있다. 논리 실력은 결국 문장을 얼마나 정확히 뒤집을 수 있는지에서 드러난다.",
          "수학에서 깊은 논리 감각은 화려한 기호 조작이 아니라, 한 문장을 다른 동치인 형태로 바꿔 문제를 더 쉬운 모양으로 만드는 능력이다.",
        ],
        keyIdeas: ["양화사 부정", "동치 변형", "반례", "문장 재구성"],
        questions: [
          "왜 양화사 부정은 반례 찾기와 직접 연결되나요?",
          "논리적으로 동치인 형태로 바꾸는 것이 문제 해결에 왜 중요하나요?",
        ],
        bridgePrompt:
          "집합과 함수 문제를 논리 문장으로 다시 써 보면 실력이 빠르게 붙는다.",
      },
    },
    sources: [
      {
        title: "Logic",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Logic",
        difficulty: "입문",
        trust: 3,
        summary: "논리의 역할과 범위를 넓게 파악할 수 있다.",
      },
      {
        title: "Propositional calculus",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Propositional_calculus",
        difficulty: "중급",
        trust: 3,
        summary: "조건문과 논리 연결이 체계로 정리되는 모습을 보여 준다.",
      },
    ],
  },
  {
    slug: "proof-methods",
    title: "증명 방식",
    category: "수학",
    summary: "명제가 왜 참인지 설득력 있게 보이는 수학의 기본 문법",
    importance:
      "수학에서 증명은 정답 해설이 아니라, 가정에서 결론으로 가는 합법적인 길을 보여 주는 일이다. 어떤 증명 방식을 선택하느냐에 따라 문제 난이도가 크게 달라진다.",
    tags: ["수학", "증명", "논증"],
    prerequisites: ["proposition", "logic", "reading-definitions"],
    related: ["set", "function", "logic"],
    crossDomainLinks: [
      {
        topicSlug: "logic",
        label: "논리",
        reason: "증명 방식 선택은 논리 구조를 읽는 능력에서 나온다.",
      },
      {
        topicSlug: "reading-definitions",
        label: "정의를 읽는 법",
        reason: "좋은 증명은 거의 항상 정의를 정확히 펼쳐 쓰는 데서 시작한다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "증명은 예시 나열이 아니라 구조 보이기",
        body: [
          "증명은 몇 개 예시를 보여 주는 것이 아니라, 왜 항상 성립하는지 설명하는 일이다. 따라서 증명 첫걸음은 결론을 이루는 문장이 어떤 형태인지 읽는 데 있다.",
          "입문 단계에서는 직접증명만으로도 충분하다. 가정을 적고, 정의를 펼치고, 필요한 대상을 임의로 잡아 결론까지 연결하는 흐름을 자주 써 보는 것이 중요하다.",
          "많은 학생이 증명을 어려워하는 이유는 '무엇을 써야 할지 모르겠다'기보다, 가정과 결론이 어떤 언어로 적혀 있는지 아직 잘 못 보기 때문이다.",
        ],
        keyIdeas: ["항상 성립", "가정과 결론", "직접증명"],
        questions: [
          "왜 예시 몇 개는 증명이 될 수 없나요?",
          "직접증명은 어떤 명제에서 가장 먼저 시도하면 좋은가요?",
        ],
        bridgePrompt:
          "명제와 정의 독해를 함께 붙이면 증명 첫 줄을 쓰는 부담이 훨씬 줄어든다.",
      },
      core: {
        title: "핵심",
        description: "직접, 대우, 귀류 중 무엇을 고를지 판단하기",
        body: [
          "직접증명은 가정에서 바로 결론으로 갈 수 있을 때 가장 좋다. 반대로 결론의 부정이 더 다루기 쉬우면 대우증명이 자연스럽고, 어떤 가정을 했을 때 모순이 명확하게 나오면 귀류법이 강력해진다.",
          "좋은 증명자는 처음부터 완성된 글을 쓰지 않는다. 먼저 결론 모양을 보고, 필요한 정의를 적어 보고, 어떤 방법이 가장 짧게 연결되는지 탐색한다.",
          "예를 들어 'x^2가 짝수이면 x는 짝수이다' 같은 명제는 직접보다 대우가 쉬울 수 있다. 이런 경험이 쌓이면 증명은 창의력 게임이 아니라 구조 인식의 문제로 바뀐다.",
        ],
        keyIdeas: ["직접증명", "대우증명", "귀류법", "전략 선택"],
        questions: [
          "대우증명이 쉬운 명제는 어떤 특징을 가지나요?",
          "귀류법은 언제 강력하지만 또 언제 남용되기 쉬운가요?",
        ],
        bridgePrompt:
          "집합 포함 관계나 함수 성질 문제에 각 증명 방식을 직접 적용해 보면 감이 빨리 붙는다.",
      },
      deep: {
        title: "심화",
        description: "정의, 보조정리, 반례를 함께 쓰는 법",
        body: [
          "심화 단계에서는 증명이 한 번에 끝나지 않는다는 점을 받아들여야 한다. 중간에 필요한 작은 주장, 즉 보조정리를 따로 세우는 것이 오히려 전체 구조를 더 깨끗하게 만든다.",
          "또한 '증명에 실패했다'는 경험은 종종 반례를 발견했다는 뜻일 수 있다. 따라서 어떤 문장이 참인지 의심되면 바로 반례 가능성을 점검하는 습관도 증명 공부의 일부다.",
          "결국 증명 공부는 멋진 문장을 쓰는 훈련이 아니라, 정의를 정확히 펼치고, 전략을 고르고, 필요한 경우 반례를 통해 명제 자체를 수정하는 사고 훈련이다.",
        ],
        keyIdeas: ["보조정리", "반례 점검", "명제 수정", "구조화"],
        questions: [
          "보조정리를 따로 세우는 것이 왜 오히려 증명을 쉽게 하나요?",
          "증명과 반례 찾기는 왜 서로 반대 작업이 아니라 같은 훈련인가요?",
        ],
        bridgePrompt:
          "함수 성질이나 집합 포함 증명을 직접 써 보면 전략 선택 능력이 빠르게 자란다.",
      },
    },
    sources: [
      {
        title: "Mathematical proof",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Mathematical_proof",
        difficulty: "입문-중급",
        trust: 3,
        summary: "증명의 기본 역할과 대표 방식들을 한 번에 볼 수 있다.",
      },
      {
        title: "Proof by contradiction",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Proof_by_contradiction",
        difficulty: "중급",
        trust: 3,
        summary: "귀류법이 실제로 어떤 구조인지 감을 잡는 데 도움이 된다.",
      },
    ],
  },
  {
    slug: "function",
    title: "함수",
    category: "수학",
    summary: "각 입력에 정확히 하나의 출력을 대응시키는 규칙으로 관계와 변화를 표현하는 도구",
    importance:
      "함수는 중등 수학 단원을 넘어 현대 수학 전체의 기본 언어다. 공식 암기보다 입력, 출력, 정의역, 공역을 정확히 읽는 습관이 먼저다.",
    tags: ["수학", "관계", "변화"],
    prerequisites: ["set", "logic", "reading-definitions"],
    related: ["proposition", "proof-methods"],
    crossDomainLinks: [
      {
        topicSlug: "set",
        label: "집합",
        reason: "함수는 집합 사이의 대응으로 정의할 때 가장 정확히 이해된다.",
      },
      {
        topicSlug: "proof-methods",
        label: "증명 방식",
        reason: "단사, 전사, 역함수 같은 성질은 정의를 펼쳐 증명하는 대표 연습 문제다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "함수는 공식이 아니라 대응 규칙이다",
        body: [
          "함수를 처음 배울 때 가장 자주 생기는 오해는 '함수=식'이라고 생각하는 것이다. 하지만 함수의 핵심은 식 모양이 아니라, 각 입력이 정확히 하나의 출력으로 간다는 대응 규칙에 있다.",
          "따라서 그림, 표, 글 설명, 알고리즘도 조건만 맞으면 함수가 될 수 있다. 중요한 것은 입력이 무엇이고, 출력이 무엇이며, 한 입력에 출력이 둘 이상 나오지 않는다는 점이다.",
          "입문 단계에서는 그래프 모양을 외우기보다 정의역과 공역을 말로 설명하는 연습이 더 중요하다. 같은 식이라도 정의역이 달라지면 전혀 다른 함수가 될 수 있다.",
        ],
        keyIdeas: ["입력과 출력", "정의역", "공역", "하나의 출력"],
        questions: [
          "왜 함수는 공식보다 대응 규칙으로 이해해야 하나요?",
          "같은 식이라도 다른 함수가 될 수 있다는 말은 무엇인가요?",
        ],
        bridgePrompt:
          "집합과 함께 보면 함수가 왜 집합 사이의 구조로 정의되는지 더 잘 보인다.",
      },
      core: {
        title: "핵심",
        description: "정의와 성질을 정확히 읽기",
        body: [
          "함수를 제대로 공부하려면 단사, 전사, 일대일대응 같은 말을 계산 기술이 아니라 정의로 읽어야 한다. 각각 어떤 입력과 출력 관계를 요구하는지 문장으로 풀 수 있어야 한다.",
          "예를 들어 단사라는 말은 서로 다른 입력이 서로 다른 출력으로 간다는 뜻이고, 전사라는 말은 공역의 모든 원소가 적어도 한 번은 출력으로 나온다는 뜻이다. 이 둘은 비슷해 보여도 전혀 다른 조건이다.",
          "또 합성함수와 역함수는 함수의 구조를 더 깊게 보여 준다. 어떤 함수 뒤에 다른 함수를 붙일 수 있다는 것, 어떤 경우에는 되돌릴 수 있다는 것이 함수 개념을 넓혀 준다.",
        ],
        keyIdeas: ["단사", "전사", "합성함수", "역함수"],
        questions: [
          "단사와 전사를 왜 따로 구분해야 하나요?",
          "역함수가 존재하려면 어떤 조건을 봐야 하나요?",
        ],
        bridgePrompt:
          "증명 방식과 함께 보면 함수 성질을 직접 정의에서 출발해 증명하는 연습을 할 수 있다.",
      },
      deep: {
        title: "심화",
        description: "함수를 구조를 옮기는 장치로 보기",
        body: [
          "심화 단계에서는 함수가 단순 계산 도구가 아니라 구조를 보존하거나 바꾸는 장치라는 점이 드러난다. 수학의 많은 분야는 어떤 대상을 직접 보지 않고 함수와 변환을 통해 성질을 읽는다.",
          "그래서 함수 공부의 핵심은 그래프를 잘 그리는 것보다, '어떤 정보를 보존하고 어떤 정보를 잃는가'를 보는 데 있다. 예를 들어 역함수가 있으면 정보 손실이 없고, 없으면 어떤 정보가 합쳐졌다고 볼 수 있다.",
          "함수를 깊게 이해하면 이후 미적분, 선형대수, 확률에서도 같은 언어가 반복된다는 사실을 알게 된다. 함수는 단원이 아니라 수학 전체의 문장 형식에 가깝다.",
        ],
        keyIdeas: ["구조 보존", "정보 손실", "변환", "수학의 공용 언어"],
        questions: [
          "함수를 구조를 옮기는 장치라고 하는 이유는 무엇인가요?",
          "역함수 존재를 정보 손실 관점에서 보면 무엇이 보이나요?",
        ],
        bridgePrompt:
          "집합, 논리, 증명과 같이 보면 함수는 계산 단원이 아니라 구조 언어라는 점이 더 선명해진다.",
      },
    },
    sources: [
      {
        title: "Function (mathematics)",
        type: "백과",
        publisher: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Function_(mathematics)",
        difficulty: "입문",
        trust: 3,
        summary: "함수 개념의 기본 구조와 주요 성질을 넓게 확인할 수 있다.",
      },
      {
        title: "What is a Function",
        type: "오픈 자료",
        publisher: "Math is Fun",
        url: "https://www.mathsisfun.com/sets/function.html",
        difficulty: "입문",
        trust: 4,
        summary: "입력과 출력 관점으로 함수를 직관적으로 설명한다.",
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
    related: [
      "general-relativity",
      "black-hole",
      "scientific-revolution",
      "epistemology",
      "skepticism",
    ],
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
      {
        topicSlug: "epistemology",
        label: "인식론",
        reason: "증거와 지식의 기준을 더 일반적인 철학 질문으로 확장해 준다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "과학이 사실을 말한다고 할 때, 우리는 무엇을 근거로 그것을 믿는가",
        body: [
          "과학철학은 과학을 공격하는 분야가 아니라, 과학이 어떻게 지식을 만들고 정당화하는지 묻는 철학 분야다. 핵심 질문은 단순하다. 무엇이 과학적 설명을 좋은 설명으로 만드는가, 관측은 왜 증거가 되는가, 이론은 어떻게 검증되는가.",
          "우리는 보통 과학이 사실을 알려 준다고 믿지만, 실제 연구 현장에서는 관측 장비, 수학적 모델, 해석 틀, 기존 이론이 함께 작동한다. 즉 데이터는 혼자서 말하지 않고 언제나 어떤 해석 구조 안에서 읽힌다.",
          "이 주제를 처음 배울 때는 과학철학을 추상 이론으로 보기보다, 블랙홀처럼 직접 보기 어려운 대상을 과학이 왜 실재한다고 말할 수 있는지 따지는 도구로 보면 훨씬 이해하기 쉽다.",
        ],
        keyIdeas: ["설명", "증거", "정당화", "이론"],
        questions: [
          "과학철학은 과학을 부정하는 학문이 아니라는 말을 왜 할 수 있습니까?",
          "데이터가 혼자서 말하지 않는다는 표현은 무엇을 뜻합니까?",
          "블랙홀 같은 사례가 과학철학 입문에 좋은 이유는 무엇입니까?",
        ],
        bridgePrompt:
          "블랙홀이나 일반상대성이론과 연결하면 추상적 질문이 실제 사례로 바뀐다.",
      },
      core: {
        title: "핵심",
        description: "관측, 모델, 검증이 어떻게 함께 움직이는지 이해하기",
        body: [
          "과학철학의 핵심은 과학 지식이 단순한 사실 모음이 아니라는 점을 이해하는 데 있다. 과학자는 관측을 수집하지만, 그 관측이 무엇을 뜻하는지는 이론과 모델에 의해 해석된다. 같은 데이터라도 어떤 가설을 세우는지에 따라 설명 방식이 달라질 수 있다.",
          "여기서 중요한 개념 하나가 이론 의존성이다. 우리는 망원경, 실험 장치, 통계 모델을 통해 세계를 보지만, 그 장치와 모델이 무엇을 측정하고 어떤 결과를 의미하는지는 이미 특정한 과학적 가정을 전제한다. 그래서 과학은 관측과 이론이 서로를 지지하고 수정하는 순환 속에서 발전한다.",
          "또 다른 핵심은 검증의 기준이다. 좋은 과학 이론은 단지 그럴듯한 이야기가 아니라, 반례 가능성을 열어 두고 다른 설명보다 더 넓은 현상을 설명해야 한다. 이때 모델의 단순성, 예측력, 설명력, 재현 가능성이 함께 평가된다.",
          "실제로 일반상대성이론이나 블랙홀 연구를 읽어 보면, 중요한 것은 관측 결과 하나가 아니라 그 결과가 어떤 모델을 더 잘 지지하는지다. 과학철학은 바로 이 지점을 읽는 훈련이다.",
        ],
        keyIdeas: ["이론 의존성", "모델", "설명력", "반례 가능성", "재현 가능성"],
        questions: [
          "관측이 항상 이론과 함께 읽힌다는 말은 왜 중요한가요?",
          "좋은 과학 이론을 판단할 때 단순히 맞았는지 외에 무엇을 봐야 하나요?",
          "블랙홀 연구에서 관측 결과 하나보다 모델 비교가 중요한 이유는 무엇인가요?",
        ],
        bridgePrompt:
          "연구자 모드에서는 논문 읽기와 출처 정리의 중심축이 된다.",
      },
      deep: {
        title: "심화",
        description: "과학의 기준과 지식의 성격을 둘러싼 대표 논쟁",
        body: [
          "심화 단계에서는 과학의 기준을 하나로 고정할 수 있는지부터 논쟁이 시작된다. 포퍼는 과학 이론이 반증 가능해야 한다고 보았고, 쿤은 실제 과학의 역사가 패러다임 전환과 정상과학의 반복 속에서 움직인다고 설명했다. 라카토시나 파이어아벤트로 가면 방법 자체가 하나로 통일되지 않는다는 주장까지 등장한다.",
          "또 다른 축은 실재론 논쟁이다. 전자나 블랙홀처럼 직접 보지 못하는 대상을 우리는 실제로 존재한다고 말해야 할까, 아니면 관측을 잘 정리하는 유용한 이론적 장치로만 봐야 할까. 이 질문은 과학이 세계를 그대로 보여 주는지, 아니면 인간이 구성한 가장 강력한 설명 체계인지를 묻는다.",
          "이 단계에서 과학철학은 추상적인 메타 논의가 아니라 연구를 읽는 방법론으로 바뀐다. 논문을 볼 때 어떤 가정이 숨어 있는지, 어떤 대안 이론이 배제되었는지, 증거가 정말 그 결론을 지지하는지 따지는 눈이 생겨야 한다.",
          "그래서 과학혁명, 일반상대성이론, 블랙홀 같은 주제를 과학철학과 함께 읽으면 단순히 내용을 아는 수준을 넘어, 지식이 어떻게 만들어지고 왜 설득력을 얻는지까지 보게 된다.",
        ],
        keyIdeas: ["반증 가능성", "패러다임 전환", "실재론", "방법론 논쟁", "이론 선택"],
        questions: [
          "포퍼와 쿤은 과학 발전을 각각 어떻게 다르게 이해했습니까?",
          "블랙홀이 실제로 존재한다고 말할 때 어떤 철학적 전제가 들어갑니까?",
          "과학철학을 연구 읽기의 도구로 쓴다는 말은 구체적으로 무엇을 보는 것입니까?",
        ],
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
      {
        title: "Karl Popper",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/popper/",
        difficulty: "심화",
        trust: 5,
        summary: "반증 가능성과 과학 방법론 논의를 따라가기에 좋다.",
      },
      {
        title: "Thomas Kuhn",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/thomas-kuhn/",
        difficulty: "심화",
        trust: 5,
        summary: "패러다임 전환과 과학사적 관점을 연결해 준다.",
      },
    ],
  },
  {
    slug: "epistemology",
    title: "인식론",
    category: "철학",
    summary: "우리가 무엇을 안다고 말할 수 있는지, 그 기준이 무엇인지를 묻는 철학 분야",
    importance:
      "철학 입문에서 가장 빨리 효과가 나는 중심 Topic으로, 회의주의와 과학철학을 함께 여는 출발점이다.",
    tags: ["철학", "지식", "정당화"],
    prerequisites: [],
    related: ["skepticism", "metaphysics", "philosophy-of-science"],
    crossDomainLinks: [
      {
        topicSlug: "philosophy-of-science",
        label: "과학철학",
        reason: "과학 지식도 결국 무엇을 근거로 믿는지라는 인식론적 질문 위에 선다.",
      },
      {
        topicSlug: "democracy",
        label: "정치철학",
        reason: "공적 판단에서 어떤 근거를 충분한 이유로 볼지 묻게 만든다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "안다와 믿는다를 구분하는 첫걸음",
        body: [
          "인식론은 우리가 무언가를 안다고 말할 때 정확히 무엇을 뜻하는지 묻는다. 단순히 사실을 외우는 문제가 아니라, 믿음이 왜 정당한지 따지는 분야다.",
          "처음 배울 때는 감각, 기억, 증언, 추론 같은 근거가 서로 어떻게 다른지 구분하는 것만으로도 큰 도움이 된다. 철학의 많은 논쟁은 결국 무엇을 지식으로 인정할지에서 갈라진다.",
        ],
        keyIdeas: ["지식", "믿음", "정당화"],
        questions: [
          "참이라고 믿는 것과 안다고 말하는 것은 왜 다른가요?",
          "우리가 어떤 믿음을 정당하다고 판단하는 기준은 무엇인가요?",
        ],
        bridgePrompt:
          "다음에는 회의주의를 통해 이 기준이 얼마나 쉽게 흔들리는지 보는 편이 좋다.",
      },
      core: {
        title: "핵심",
        description: "정당화와 오류 가능성을 함께 보기",
        body: [
          "인식론의 핵심은 지식을 사실과 믿음의 단순 결합으로 보지 않는 데 있다. 어떤 믿음이 우연히 맞는 것과, 이유를 가지고 정당하게 성립하는 것은 다르다.",
          "여기서 중요한 축은 정당화의 방식이다. 직접 경험이 중요한지, 다른 믿음과의 일관성이 중요한지, 혹은 인지 과정이 얼마나 신뢰할 만한지가 중요하다는 입장이 서로 경쟁한다.",
          "그래서 인식론은 답을 하나 주기보다, 우리가 근거를 세우는 방식을 해부하게 만든다. 철학 텍스트를 읽을 때도 결국 어떤 전제가 숨겨져 있는지, 어떤 이유가 결론을 떠받치는지 보게 된다.",
        ],
        keyIdeas: ["정당화", "오류 가능성", "경험", "신뢰성"],
        questions: [
          "우연히 참인 믿음과 정당한 지식은 어떻게 다릅니까?",
          "감각 경험, 추론, 증언은 각각 어떤 한계를 가집니까?",
          "신뢰할 만한 인지 과정이라는 말은 왜 중요한가요?",
        ],
        bridgePrompt:
          "회의주의와 함께 읽으면 인식론이 왜 단순 개념 정리가 아닌지 분명해진다.",
      },
      deep: {
        title: "심화",
        description: "지식의 조건을 둘러싼 대표 논쟁",
        body: [
          "심화 단계에서는 게티어 문제처럼, 정당화된 참된 믿음만으로 지식을 설명하기 어렵다는 논쟁이 등장한다. 이 지점에서 철학은 정의 하나를 외우는 학문이 아니라 개념의 경계를 반복해서 시험하는 학문이라는 점이 드러난다.",
          "또한 인식론은 개인의 믿음만이 아니라 공동체의 판단 기준까지 확장된다. 과학 지식, 역사 해석, 정치적 판단도 결국 어떤 근거와 절차를 신뢰할지의 문제로 다시 연결된다.",
        ],
        keyIdeas: ["게티어 문제", "개념의 경계", "공동체적 판단"],
        questions: [
          "정당화된 참된 믿음만으로 지식을 정의하기 어려운 이유는 무엇입니까?",
          "개인의 인식론과 과학·정치의 공적 판단은 어떻게 연결됩니까?",
        ],
        bridgePrompt:
          "과학철학으로 이동하면 인식론 질문이 실제 연구와 증거 평가에 어떻게 쓰이는지 보인다.",
      },
    },
    sources: [
      {
        title: "Epistemology",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/epistemology",
        difficulty: "입문",
        trust: 4,
        summary: "인식론의 범위와 핵심 질문을 빠르게 잡기에 좋다.",
      },
      {
        title: "Epistemology",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/epistemology/",
        difficulty: "심화",
        trust: 5,
        summary: "정당화, 지식 조건, 주요 논쟁을 체계적으로 다룬다.",
      },
    ],
  },
  {
    slug: "skepticism",
    title: "회의주의",
    category: "철학",
    summary: "우리가 알고 있다고 여기는 것들이 실제로는 얼마나 불확실할 수 있는지를 따지는 입장",
    importance:
      "철학 입문자가 지식의 조건을 실제로 시험해 보는 가장 강력한 Topic으로, 인식론을 살아 있게 만든다.",
    tags: ["철학", "의심", "지식의 한계"],
    prerequisites: ["epistemology"],
    related: ["epistemology", "metaphysics", "philosophy-of-mind"],
    crossDomainLinks: [
      {
        topicSlug: "philosophy-of-science",
        label: "과학철학",
        reason: "과학도 의심을 무한히 키우는 대신 어떤 수준에서 증거를 받아들이는지 묻게 만든다.",
      },
      {
        topicSlug: "black-hole",
        label: "천문학",
        reason: "직접 보지 못한 대상을 믿는 문제를 더 선명하게 드러내는 사례다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "의심이 단순한 부정이 아니라는 점 이해하기",
        body: [
          "회의주의는 모든 것을 비웃듯 부정하는 태도가 아니라, 우리가 지식이라고 부르는 것의 기준을 더 엄격하게 묻는 입장이다.",
          "처음에는 데카르트식 의심처럼 감각이 우리를 속일 수 있다는 사례만 떠올려도 충분하다. 중요한 것은 의심 자체보다, 의심을 통과하고도 남는 것이 무엇인지다.",
        ],
        keyIdeas: ["의심", "감각의 한계", "기준 시험"],
        questions: [
          "회의주의는 단순한 냉소와 어떻게 다릅니까?",
          "감각을 의심한다는 말은 무엇을 흔드는 것입니까?",
        ],
        bridgePrompt:
          "인식론으로 돌아가 어떤 믿음이 의심을 견디는지 따져 보면 좋다.",
      },
      core: {
        title: "핵심",
        description: "회의주의가 지식론을 압박하는 방식",
        body: [
          "회의주의는 우리가 제시하는 근거가 끝없이 더 큰 근거를 요구하게 만든다. 이 압박 앞에서 어떤 철학자는 확실한 기초를 찾으려 하고, 어떤 철학자는 완전한 확실성 대신 충분한 정당화를 말한다.",
          "그래서 회의주의는 철학을 멈추게 하는 Topic이 아니라, 오히려 논증을 정교하게 만드는 장치가 된다. 무엇을 근거라고 부를지, 어디서 탐구를 멈출 수 있는지를 다시 묻게 만들기 때문이다.",
        ],
        keyIdeas: ["근거의 후퇴", "기초", "충분한 정당화"],
        questions: [
          "회의주의는 왜 근거를 끝없이 요구하는 것처럼 보이나요?",
          "철학자들은 회의주의에 어떻게 대응해 왔나요?",
        ],
        bridgePrompt:
          "형이상학과 연결하면 세계 자체를 어떻게 상정하는지가 왜 중요한지도 보인다.",
      },
      deep: {
        title: "심화",
        description: "현대 지식론과 과학적 태도 속의 회의",
        body: [
          "심화 단계에서는 회의주의를 반드시 논파해야 하는 적으로 보기보다, 탐구를 과도한 확신에서 구해 주는 장치로 읽을 수 있다. 과학도 무한한 의심을 유지하지는 않지만, 반증 가능성과 오류 수정 가능성을 제도화한다.",
          "이 관점에서 회의주의는 철학과 과학 모두에서 기준을 세우는 압력으로 작동한다. 지식이란 단단한 성채가 아니라, 수정 가능성을 안고도 충분히 설득력 있는 구조라는 점이 드러난다.",
        ],
        keyIdeas: ["오류 수정", "반증 가능성", "탐구의 겸손"],
        questions: [
          "회의주의를 완전히 제거하지 않고도 지식을 말할 수 있는 이유는 무엇입니까?",
          "과학의 검증 태도와 철학의 회의는 어디서 닮고 어디서 다릅니까?",
        ],
        bridgePrompt:
          "과학철학으로 가면 회의가 실제 연구 설계와 검증 기준 안에 어떻게 들어가는지 보인다.",
      },
    },
    sources: [
      {
        title: "Skepticism",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/skepticism/",
        difficulty: "심화",
        trust: 5,
        summary: "고대부터 현대까지 회의주의의 구조와 대응을 정리한다.",
      },
      {
        title: "Scepticism",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/skepticism-philosophy",
        difficulty: "입문-중급",
        trust: 4,
        summary: "회의주의의 기본 윤곽과 역사적 맥락을 훑기 좋다.",
      },
    ],
  },
  {
    slug: "metaphysics",
    title: "형이상학",
    category: "철학",
    summary: "세계가 무엇으로 이루어져 있으며 존재와 동일성, 가능성과 시간은 어떻게 이해되는지를 묻는 철학 분야",
    importance:
      "철학 학습자가 지식의 문제를 넘어 세계의 구조 자체를 다루게 만드는 중심 Topic으로, 마음의 철학과 자연스럽게 이어진다.",
    tags: ["철학", "존재", "세계의 구조"],
    prerequisites: ["epistemology"],
    related: ["skepticism", "philosophy-of-mind", "epistemology"],
    crossDomainLinks: [
      {
        topicSlug: "philosophy-of-mind",
        label: "마음의 철학",
        reason: "마음과 몸의 관계는 형이상학적 존재론이 어떻게 적용되는지를 보여 준다.",
      },
      {
        topicSlug: "spacetime",
        label: "물리학",
        reason: "시간과 공간을 무엇으로 이해할지는 과학과 형이상학이 만나는 대표 주제다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "세계의 가장 기본적인 질문 만나기",
        body: [
          "형이상학은 눈에 보이지 않는 신비를 말하는 분야가 아니라, 세계가 무엇으로 이루어져 있다고 이해해야 하는지 묻는 학문이다.",
          "무엇이 존재한다고 말할 수 있는지, 하나의 대상이 시간이 지나도 같은 대상인지, 가능성과 현실은 어떻게 다른지 같은 질문이 모두 형이상학에 들어간다.",
        ],
        keyIdeas: ["존재", "동일성", "가능성"],
        questions: [
          "형이상학은 왜 현실과 동떨어진 추상이 아니라 기본 질문이 되나요?",
          "한 대상이 시간이 지나도 같은 대상이라는 말은 무엇을 뜻하나요?",
        ],
        bridgePrompt:
          "다음에는 마음의 철학으로 가서 형이상학 질문이 실제 논쟁에서 어떻게 쓰이는지 볼 수 있다.",
      },
      core: {
        title: "핵심",
        description: "존재론과 동일성 문제를 구조로 보기",
        body: [
          "형이상학의 핵심은 세계를 기술하는 가장 기본 범주를 세우는 일이다. 사물, 사건, 속성, 관계 같은 범주를 어떻게 구분하느냐에 따라 철학적 설명 전체가 달라진다.",
          "또 중요한 축은 동일성의 문제다. 어떤 존재가 변화해도 같은 것으로 남는다고 말할 수 있는지, 시간 속의 나와 지금의 내가 어떻게 연결되는지 같은 질문은 형이상학적 전제를 드러낸다.",
          "이 단계부터 형이상학은 단순한 사변이 아니라, 다른 철학 분야가 기대고 있는 바닥 구조를 밝히는 작업으로 보이기 시작한다.",
        ],
        keyIdeas: ["존재론", "범주", "동일성", "시간"],
        questions: [
          "존재론적 범주를 세운다는 것은 왜 중요한가요?",
          "변화 속에서도 동일성을 유지한다고 말할 때 어떤 전제가 들어갑니까?",
        ],
        bridgePrompt:
          "회의주의와 함께 읽으면 세계 구조와 인식 조건이 어떻게 맞물리는지 보인다.",
      },
      deep: {
        title: "심화",
        description: "현대 논쟁의 접점들",
        body: [
          "심화 단계에서는 시간의 본성, 자유의지와 결정론, 보편자와 개별자 같은 논쟁이 등장한다. 이 지점의 형이상학은 거의 모든 철학 분야와 연결되는 허브에 가깝다.",
          "특히 마음의 철학과 연결하면 의식이 물리적 세계 안에서 어떤 지위를 가지는지, 단순히 뇌 상태로 환원될 수 있는지 같은 문제가 더 선명하게 드러난다.",
        ],
        keyIdeas: ["시간", "자유의지", "보편자", "환원 문제"],
        questions: [
          "형이상학이 다른 철학 분야의 배경 구조라고 할 수 있는 이유는 무엇입니까?",
          "마음을 물리 세계 안에 놓는다는 문제는 왜 형이상학과 연결됩니까?",
        ],
        bridgePrompt:
          "마음의 철학으로 이동하면 형이상학이 실제 논쟁에서 어떻게 작동하는지 바로 확인할 수 있다.",
      },
    },
    sources: [
      {
        title: "Metaphysics",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/metaphysics",
        difficulty: "입문",
        trust: 4,
        summary: "형이상학의 범위와 대표 문제를 넓게 소개한다.",
      },
      {
        title: "Metaphysics",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/metaphysics/",
        difficulty: "심화",
        trust: 5,
        summary: "존재론과 형이상학의 핵심 논점을 정교하게 따라갈 수 있다.",
      },
    ],
  },
  {
    slug: "philosophy-of-mind",
    title: "마음의 철학",
    category: "철학",
    summary: "의식, 생각, 감정, 자아가 무엇이며 몸과 어떤 관계를 맺는지를 묻는 철학 분야",
    importance:
      "형이상학을 추상에 머물지 않게 만들고, 현대 철학 입문자가 가장 빠르게 몰입할 수 있는 대표 Topic이다.",
    tags: ["철학", "의식", "자아"],
    prerequisites: ["metaphysics", "epistemology"],
    related: ["metaphysics", "skepticism", "ethics"],
    crossDomainLinks: [
      {
        topicSlug: "metaphysics",
        label: "형이상학",
        reason: "마음이 어떤 존재자인지에 대한 입장은 형이상학적 전제 위에서 갈린다.",
      },
      {
        topicSlug: "philosophy-of-science",
        label: "과학철학",
        reason: "의식 연구와 설명 모델을 볼 때도 관찰, 이론, 환원의 문제가 함께 등장한다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "내 마음은 무엇인가라는 질문 풀어 보기",
        body: [
          "마음의 철학은 의식, 생각, 감정, 자아 같은 익숙한 경험을 철학적으로 해부하는 분야다. 그래서 입문자가 가장 빨리 질문의 재미를 느끼기 쉽다.",
          "핵심 질문은 단순하다. 마음은 뇌와 같은 것인가, 의식 경험은 물리 설명만으로 충분한가, 나는 왜 하나의 동일한 자아라고 느끼는가.",
        ],
        keyIdeas: ["의식", "자아", "마음과 몸"],
        questions: [
          "마음과 뇌를 같은 것이라고 말한다는 것은 무엇을 뜻하나요?",
          "의식 경험은 왜 철학에서 특별한 문제로 다뤄지나요?",
        ],
        bridgePrompt:
          "형이상학으로 돌아가면 마음이 어떤 종류의 존재자인지 더 명확히 볼 수 있다.",
      },
      core: {
        title: "핵심",
        description: "마음-몸 문제와 설명 경쟁",
        body: [
          "마음의 철학에서 가장 유명한 구조는 심신 문제다. 마음이 물리 상태와 완전히 동일한지, 별도의 성질을 가지는지, 혹은 기능적 조직으로 이해해야 하는지가 대표적인 갈래다.",
          "여기서 중요한 것은 특정 입장을 외우는 것이 아니라, 각 입장이 무엇을 잘 설명하고 무엇을 놓치는지 비교하는 일이다. 예를 들어 물리주의는 과학과 잘 맞지만 주관적 의식의 질감을 설명하기 어렵다고 비판받는다.",
        ],
        keyIdeas: ["심신 문제", "물리주의", "이원론", "기능주의"],
        questions: [
          "물리주의와 이원론은 마음을 각각 어떻게 이해합니까?",
          "설명력이 높다는 것과 경험을 충분히 포착한다는 것은 왜 다를 수 있나요?",
        ],
        bridgePrompt:
          "윤리학과 연결하면 마음의 개념이 책임과 행위 이해에 왜 중요한지도 보인다.",
      },
      deep: {
        title: "심화",
        description: "의식과 자아를 둘러싼 현대 논의",
        body: [
          "심화 단계에서는 퀄리아, 의식의 어려운 문제, 개인 동일성 같은 논쟁이 등장한다. 이 지점에서 마음의 철학은 형이상학, 인식론, 심리학, 인공지능 논의와 동시에 닿는다.",
          "또한 마음을 이해하는 방식은 도덕적 책임과 정치적 판단에도 영향을 준다. 인간을 어떤 존재로 보느냐가 자유, 책임, 권리의 해석과 직접 연결되기 때문이다.",
        ],
        keyIdeas: ["퀄리아", "개인 동일성", "도덕적 책임"],
        questions: [
          "의식의 어려운 문제라고 부르는 것은 정확히 무엇입니까?",
          "자아와 개인 동일성 논쟁은 왜 윤리와 정치철학에도 영향을 줍니까?",
        ],
        bridgePrompt:
          "윤리학으로 이동하면 사람을 책임 주체로 본다는 것이 무엇을 전제하는지 더 분명해진다.",
      },
    },
    sources: [
      {
        title: "Philosophy of mind",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/philosophy-of-mind",
        difficulty: "입문",
        trust: 4,
        summary: "마음의 철학의 범위와 대표 질문을 빠르게 훑기 좋다.",
      },
      {
        title: "Dualism",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/dualism/",
        difficulty: "심화",
        trust: 5,
        summary: "심신 문제의 고전적 구도를 깊게 따라갈 수 있다.",
      },
    ],
  },
  {
    slug: "ethics",
    title: "윤리학",
    category: "철학",
    summary: "무엇이 옳은 행위인지, 어떤 삶이 좋은 삶인지, 우리는 서로에게 무엇을 요구할 수 있는지를 묻는 철학 분야",
    importance:
      "철학이 삶과 제도에 직접 닿는 지점이며, 정치철학과 민주주의로 이어지는 핵심 입문 Topic이다.",
    tags: ["철학", "도덕", "행위"],
    prerequisites: [],
    related: ["political-philosophy", "democracy", "philosophy-of-mind"],
    crossDomainLinks: [
      {
        topicSlug: "political-philosophy",
        label: "정치철학",
        reason: "개인의 옳음에 대한 질문은 곧 제도와 공동체의 정의 문제로 이어진다.",
      },
      {
        topicSlug: "democracy",
        label: "민주주의",
        reason: "권리와 책임의 분배를 제도 수준에서 어떻게 구현할지 묻는다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "무엇이 옳은가를 묻는 기본 구조",
        body: [
          "윤리학은 착하게 살자는 훈계가 아니라, 어떤 행위와 삶을 좋다고 평가할 수 있는지 따지는 철학 분야다.",
          "입문 단계에서는 결과를 중시하는지, 의무를 중시하는지, 품성을 중시하는지 같은 큰 축만 구분해도 충분하다. 중요한 것은 서로 다른 도덕 판단이 왜 충돌하는지 구조를 보는 일이다.",
        ],
        keyIdeas: ["옳음", "좋은 삶", "판단 기준"],
        questions: [
          "윤리학은 왜 개인 취향 문제가 아니라 철학적 주제가 되나요?",
          "결과, 의무, 덕을 중심으로 보는 관점은 어떻게 다릅니까?",
        ],
        bridgePrompt:
          "정치철학으로 가면 개인의 윤리 문제가 공동체의 제도 문제로 확장된다.",
      },
      core: {
        title: "핵심",
        description: "행위 판단과 삶의 평가를 함께 보기",
        body: [
          "윤리학의 핵심은 구체적 사례마다 즉흥적으로 답을 내리는 것이 아니라, 판단의 기준을 명확히 세우는 데 있다. 같은 행동도 결과를 중시하면 다르게 평가되고, 의무나 권리를 중시하면 또 다르게 평가된다.",
          "또 윤리학은 개별 행위만이 아니라 어떤 삶이 좋은 삶인지도 묻는다. 그래서 도덕 규칙, 성품, 관계, 공동체가 모두 한 프레임 안에 들어온다.",
        ],
        keyIdeas: ["행위 평가", "권리", "덕", "좋은 삶"],
        questions: [
          "도덕 판단의 기준을 세운다는 말은 무엇을 뜻합니까?",
          "행위 윤리와 좋은 삶의 윤리는 왜 함께 봐야 하나요?",
        ],
        bridgePrompt:
          "민주주의와 정치철학으로 이동하면 윤리적 판단이 제도 설계로 번역되는 과정이 보인다.",
      },
      deep: {
        title: "심화",
        description: "현대 윤리 논쟁의 연결점",
        body: [
          "심화 단계에서는 자유와 책임, 돌봄과 정의, 개인의 권리와 공동체의 선 같은 긴장이 중요해진다. 윤리학은 정답을 모아 두는 학문이라기보다, 경쟁하는 가치들이 어떤 기준으로 충돌하는지 분석하는 학문에 가깝다.",
          "이 지점에서 윤리학은 정치철학과 직접 연결된다. 어떤 인간관을 전제하느냐, 책임과 배려를 어떻게 이해하느냐가 곧 제도적 정의와 권리 논쟁을 바꾸기 때문이다.",
        ],
        keyIdeas: ["자유와 책임", "돌봄", "정의", "가치 충돌"],
        questions: [
          "윤리학에서 가치 충돌을 분석한다는 것은 무엇입니까?",
          "윤리학의 인간관은 왜 정치철학의 제도 논쟁으로 이어집니까?",
        ],
        bridgePrompt:
          "정치철학으로 가면 개인의 옳음이 공동체의 정의로 어떻게 이동하는지 확인할 수 있다.",
      },
    },
    sources: [
      {
        title: "Ethics",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/ethics-philosophy",
        difficulty: "입문",
        trust: 4,
        summary: "윤리학의 범위와 주요 전통을 빠르게 훑기 좋다.",
      },
      {
        title: "Virtue Ethics",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/ethics-virtue/",
        difficulty: "심화",
        trust: 5,
        summary: "윤리학의 대표 축 중 하나를 깊게 읽으며 판단 기준을 비교할 수 있다.",
      },
    ],
  },
  {
    slug: "political-philosophy",
    title: "정치철학",
    category: "철학",
    summary: "권력, 자유, 평등, 권리, 정의가 어떤 원리 위에서 정당화될 수 있는지를 묻는 철학 분야",
    importance:
      "윤리학을 제도와 공동체 차원으로 확장해 주며, 민주주의와 역사적 혁명 Topic을 철학적으로 읽게 만든다.",
    tags: ["철학", "정의", "권리"],
    prerequisites: ["ethics"],
    related: ["democracy", "french-revolution", "ethics"],
    crossDomainLinks: [
      {
        topicSlug: "democracy",
        label: "민주주의",
        reason: "정치철학의 원리가 실제 제도와 참여 구조에서 어떻게 구현되는지 본다.",
      },
      {
        topicSlug: "french-revolution",
        label: "역사",
        reason: "권리와 시민의 언어가 현실 정치에서 어떤 긴장을 겪는지 보여 준다.",
      },
    ],
    layers: {
      light: {
        title: "입문",
        description: "옳은 공동체를 묻는 철학",
        body: [
          "정치철학은 정치를 뉴스나 권력 싸움으로 보는 대신, 어떤 공동체가 정당한지 묻는 철학 분야다. 자유, 평등, 권리, 정의 같은 언어가 여기서 구조를 가진다.",
          "입문자는 먼저 개인 윤리와 정치철학의 차이를 잡으면 좋다. 윤리학이 내가 어떻게 살아야 하는지를 묻는다면, 정치철학은 우리가 어떤 제도 아래 함께 살아야 하는지를 묻는다.",
        ],
        keyIdeas: ["자유", "평등", "권리", "정의"],
        questions: [
          "정치철학은 단순한 정치 상식과 무엇이 다릅니까?",
          "개인의 윤리 문제와 제도의 정의 문제는 어떻게 이어지나요?",
        ],
        bridgePrompt:
          "민주주의로 이동하면 정치철학 원리가 실제 참여 제도로 어떻게 번역되는지 보인다.",
      },
      core: {
        title: "핵심",
        description: "정당성의 기준 세우기",
        body: [
          "정치철학의 핵심은 누가 권력을 가져야 하는지보다, 어떤 권력이 정당한지의 기준을 세우는 데 있다. 이때 동의, 권리 보호, 공정한 분배, 자유 보장 같은 기준이 서로 경쟁한다.",
          "또 중요한 것은 개인과 공동체의 관계다. 개인 자유를 우선할 것인지, 공동선을 더 중시할 것인지에 따라 같은 제도도 매우 다르게 평가된다.",
        ],
        keyIdeas: ["정당성", "분배", "개인과 공동체"],
        questions: [
          "정치철학에서 정당성은 왜 핵심 개념입니까?",
          "자유와 평등이 충돌할 때 어떤 기준으로 판단할 수 있나요?",
        ],
        bridgePrompt:
          "프랑스 혁명과 함께 읽으면 정치철학 언어가 역사 속에서 어떤 가격을 치렀는지 보인다.",
      },
      deep: {
        title: "심화",
        description: "정의와 제도 모델을 둘러싼 논쟁",
        body: [
          "심화 단계에서는 자유주의, 공화주의, 공동체주의, 평등주의 같은 큰 틀이 서로 무엇을 우선순위에 두는지 비교하게 된다. 이 단계의 정치철학은 단일 정답보다 경쟁하는 원리들의 구조를 파악하는 데 가깝다.",
          "민주주의, 권리, 복지, 시민 불복종 같은 주제를 볼 때도 결국 어떤 인간관과 공동체관을 전제하는지가 중요하다. 그래서 정치철학은 철학 입문자가 사회 이슈를 개념적으로 다시 읽게 만드는 강력한 허브가 된다.",
        ],
        keyIdeas: ["자유주의", "공동체주의", "시민성", "제도 모델"],
        questions: [
          "정의 이론을 비교할 때 무엇을 기준으로 삼아야 합니까?",
          "정치철학의 인간관은 실제 제도 논쟁에 어떻게 스며듭니까?",
        ],
        bridgePrompt:
          "민주주의와 왕복하면 추상 원리와 실제 제도 긴장을 함께 볼 수 있다.",
      },
    },
    sources: [
      {
        title: "Political philosophy",
        type: "백과",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/political-philosophy",
        difficulty: "입문",
        trust: 4,
        summary: "정치철학의 주요 질문과 전통을 넓게 소개한다.",
      },
      {
        title: "Political Philosophy",
        type: "철학 자료",
        publisher: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/political-philosophy/",
        difficulty: "심화",
        trust: 5,
        summary: "정의, 자유, 권리, 국가를 둘러싼 대표 논쟁을 체계적으로 다룬다.",
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
    prerequisites: ["political-philosophy", "french-revolution"],
    related: ["french-revolution", "political-philosophy", "ethics", "philosophy-of-science"],
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
      {
        topicSlug: "political-philosophy",
        label: "정치철학",
        reason: "민주주의를 제도 설명이 아니라 정당성 이론으로 읽게 해 준다.",
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
  "set",
  "epistemology",
  "ethics",
  "philosophy-of-mind",
  "black-hole",
  "philosophy-of-science",
  "french-revolution",
];

export const guidePresets: GuidePreset[] = [
  {
    id: "math-language-start",
    label: "수학 언어 입문",
    query: "집합, 명제, 논리, 함수를 순서대로 이해하면서 수학 읽는 법을 익히고 싶음",
  },
  {
    id: "philosophy-start",
    label: "철학 처음 시작",
    query: "철학을 처음 배우는데 인식론이랑 회의주의부터 차근차근 시작하고 싶음",
  },
  {
    id: "mind-self",
    label: "마음과 자아 질문",
    query: "의식이 뭐고 마음과 몸이 어떻게 연결되는지 철학적으로 배우고 싶음",
  },
  {
    id: "metaphysics-free-will",
    label: "형이상학과 자유의지",
    query: "존재, 동일성, 자유의지 문제를 철학적으로 차근차근 배우고 싶음",
  },
  {
    id: "ethics-politics",
    label: "윤리에서 정치철학",
    query: "윤리학부터 시작해서 정치철학과 민주주의까지 이어서 보고 싶음",
  },
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
    slug: "math-language-basics",
    title: "집합에서 함수까지",
    goal: "수학 텍스트를 읽는 최소 문법을 만들기",
    startTopicSlug: "reading-definitions",
    currentTopicSlug: "logic",
    nextTopicSlugs: ["proof-methods", "function"],
    steps: [
      {
        topicSlug: "reading-definitions",
        depth: "light",
        status: "completed",
        note: "정의 문장을 조건과 결론으로 나누어 읽는 감각을 먼저 만든다.",
      },
      {
        topicSlug: "set",
        depth: "light",
        status: "completed",
        note: "원소, 부분집합, 연산을 문장으로 해석하는 법을 익힌다.",
      },
      {
        topicSlug: "proposition",
        depth: "light",
        status: "completed",
        note: "참과 거짓을 판별할 수 있는 문장 구조를 먼저 구분한다.",
      },
      {
        topicSlug: "logic",
        depth: "core",
        status: "current",
        note: "조건문, 대우, 경우 나누기를 읽는 법을 붙인다.",
      },
      {
        topicSlug: "proof-methods",
        depth: "light",
        status: "suggested",
        note: "직접, 대우, 귀류법 중 어떤 전략을 쓸지 판단하는 훈련으로 넘어간다.",
      },
      {
        topicSlug: "function",
        depth: "light",
        status: "suggested",
        note: "집합 언어를 바탕으로 대응 규칙과 구조 해석으로 확장한다.",
      },
    ],
  },
  {
    slug: "philosophy-basics",
    title: "인식론에서 마음의 철학까지",
    goal: "지식의 기준을 묻는 질문에서 세계와 마음의 구조로 확장하기",
    startTopicSlug: "epistemology",
    currentTopicSlug: "skepticism",
    nextTopicSlugs: ["metaphysics", "philosophy-of-mind"],
    steps: [
      {
        topicSlug: "epistemology",
        depth: "light",
        status: "completed",
        note: "안다와 믿는다의 차이를 먼저 잡는다.",
      },
      {
        topicSlug: "skepticism",
        depth: "light",
        status: "current",
        note: "지식의 기준이 어떻게 흔들리는지 시험한다.",
      },
      {
        topicSlug: "metaphysics",
        depth: "core",
        status: "suggested",
        note: "세계와 동일성의 기본 구조로 이동한다.",
      },
      {
        topicSlug: "philosophy-of-mind",
        depth: "light",
        status: "suggested",
        note: "마음과 자아 문제를 실제 논쟁으로 읽는다.",
      },
    ],
  },
  {
    slug: "ethics-to-democracy",
    title: "윤리학에서 민주주의까지",
    goal: "개인의 옳음에서 공동체의 정의와 제도로 확장하기",
    startTopicSlug: "ethics",
    currentTopicSlug: "political-philosophy",
    nextTopicSlugs: ["democracy", "french-revolution"],
    steps: [
      {
        topicSlug: "ethics",
        depth: "light",
        status: "completed",
        note: "도덕 판단의 큰 기준들을 먼저 구분한다.",
      },
      {
        topicSlug: "political-philosophy",
        depth: "light",
        status: "current",
        note: "권리, 자유, 평등의 정당화 구조를 본다.",
      },
      {
        topicSlug: "democracy",
        depth: "core",
        status: "suggested",
        note: "정치철학 원리가 실제 제도에서 어떻게 구현되는지 본다.",
      },
      {
        topicSlug: "french-revolution",
        depth: "light",
        status: "suggested",
        note: "역사 사례로 되돌아가 개념의 긴장을 확인한다.",
      },
    ],
  },
  {
    slug: "metaphysics-to-mind",
    title: "형이상학에서 마음의 철학까지",
    goal: "존재와 동일성 문제에서 의식과 자아의 구조로 이동하기",
    startTopicSlug: "metaphysics",
    currentTopicSlug: "philosophy-of-mind",
    nextTopicSlugs: ["ethics", "philosophy-of-science"],
    steps: [
      {
        topicSlug: "metaphysics",
        depth: "light",
        status: "completed",
        note: "존재와 동일성의 기본 구조를 먼저 잡는다.",
      },
      {
        topicSlug: "philosophy-of-mind",
        depth: "light",
        status: "current",
        note: "마음과 몸, 의식과 자아의 논쟁으로 들어간다.",
      },
      {
        topicSlug: "ethics",
        depth: "core",
        status: "suggested",
        note: "인간관이 책임과 판단 문제로 어떻게 이어지는지 본다.",
      },
      {
        topicSlug: "philosophy-of-science",
        depth: "deep",
        status: "suggested",
        note: "설명과 환원의 문제를 과학철학으로 확장한다.",
      },
    ],
  },
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
    title: "프랑스 혁명에서 정치철학까지",
    goal: "사건사에서 정치 원리와 민주주의 개념으로 이동하기",
    startTopicSlug: "french-revolution",
    currentTopicSlug: "french-revolution",
    nextTopicSlugs: ["political-philosophy", "democracy"],
    steps: [
      {
        topicSlug: "french-revolution",
        depth: "light",
        status: "current",
        note: "근대 정치의 전환점부터 이해한다.",
      },
      {
        topicSlug: "political-philosophy",
        depth: "light",
        status: "suggested",
        note: "사건을 정당성, 권리, 정의의 언어로 다시 읽는다.",
      },
      {
        topicSlug: "democracy",
        depth: "light",
        status: "suggested",
        note: "혁명이 남긴 제도적 언어와 참여 원리로 확장한다.",
      },
    ],
  },
];

export const workspaces: Workspace[] = [
  {
    slug: "philosophy-core-questions",
    title: "철학 핵심 질문 워크스페이스",
    mode: "학습자 모드",
    focusQuestion:
      "우리는 무엇을 알 수 있고, 세계와 마음은 무엇이며, 그 이해가 삶의 판단으로 어떻게 이어지는가?",
    relatedDomains: ["철학", "과학철학", "정치철학"],
    questionList: [
      "지식이라고 부를 수 있는 믿음의 기준은 무엇인가?",
      "회의를 통과하고도 남는 근거는 어디까지 가능한가?",
      "마음과 자아를 물리 세계 안에서 어떻게 이해할 수 있는가?",
    ],
    debateMap: [
      {
        title: "게티어 이후의 지식 조건",
        detail: "정당화된 참된 믿음만으로 충분한가, 아니면 다른 조건이 필요한가",
      },
      {
        title: "심신 문제",
        detail: "마음은 뇌와 동일한가, 별도의 성질인가, 아니면 기능적 구조인가",
      },
      {
        title: "회의의 역할",
        detail: "회의주의는 지식을 파괴하는가, 아니면 탐구 기준을 더 정교하게 만드는가",
      },
    ],
    savedTopicSlugs: [
      "epistemology",
      "skepticism",
      "metaphysics",
      "philosophy-of-mind",
      "philosophy-of-science",
    ],
    savedSources: [
      {
        title: "Epistemology",
        publisher: "Stanford Encyclopedia of Philosophy",
        type: "철학 자료",
        note: "지식과 정당화의 구조를 정리하는 기준 문서",
      },
      {
        title: "Skepticism",
        publisher: "Stanford Encyclopedia of Philosophy",
        type: "철학 자료",
        note: "회의주의의 압박 구조와 대응 정리",
      },
      {
        title: "Philosophy of mind",
        publisher: "Britannica",
        type: "백과",
        note: "심신 문제 입문 연결용 참고",
      },
    ],
    noteBlocks: [
      "철학 입문에서는 답을 외우기보다 어떤 질문이 무엇을 시험하는지 먼저 구분해야 한다.",
      "인식론, 회의주의, 형이상학, 마음의 철학은 따로 떨어진 과목이 아니라 하나의 연쇄 구조로 읽는 편이 이해가 빠르다.",
      "과학철학은 철학 바깥의 Topic이 아니라, 인식론 질문이 실제 연구와 증거 평가에 적용되는 장면이다.",
    ],
  },
  {
    slug: "ethics-public-life",
    title: "윤리와 공적 삶 워크스페이스",
    mode: "연구자 모드",
    focusQuestion:
      "개인의 도덕 판단은 어떤 원리로 제도와 민주주의의 정당성 문제로 이어지는가?",
    relatedDomains: ["철학", "정치철학", "역사"],
    questionList: [
      "윤리학의 판단 기준은 정치철학의 정의 원리로 어떻게 확장되는가?",
      "민주주의는 제도 설명을 넘어 어떤 철학적 정당화가 필요한가?",
      "프랑스 혁명 같은 사건은 정치철학 개념을 어떻게 시험하는가?",
    ],
    debateMap: [
      {
        title: "자유와 평등의 긴장",
        detail: "두 가치를 동시에 지키려 할 때 어떤 제도 설계가 가능한가",
      },
      {
        title: "권리와 공동선",
        detail: "개인의 권리를 우선할지 공동체의 선을 더 중시할지에 따라 정의 개념이 갈린다",
      },
      {
        title: "민주주의의 정당성",
        detail: "다수결만으로 충분한지, 숙의·권리 보호·책임성이 함께 필요할지 따진다",
      },
    ],
    savedTopicSlugs: [
      "ethics",
      "political-philosophy",
      "democracy",
      "french-revolution",
    ],
    savedSources: [
      {
        title: "Political Philosophy",
        publisher: "Stanford Encyclopedia of Philosophy",
        type: "철학 자료",
        note: "정의와 정당성 논의의 기본 구조 정리",
      },
      {
        title: "Democracy",
        publisher: "Stanford Encyclopedia of Philosophy",
        type: "철학 자료",
        note: "민주주의 모델과 긴장을 깊게 따라가기 좋다",
      },
      {
        title: "French Revolution",
        publisher: "Britannica",
        type: "백과",
        note: "개념이 현실 정치에서 시험된 역사 장면 정리",
      },
    ],
    noteBlocks: [
      "윤리학에서 정치철학으로 넘어갈 때는 행위의 옳음을 묻는 질문이 제도의 정당성을 묻는 질문으로 커진다는 점을 붙잡아야 한다.",
      "민주주의는 정치제도 요약이 아니라 정당성, 참여, 권리 보호를 둘러싼 경쟁 모델의 묶음으로 보는 편이 낫다.",
      "역사 Topic을 함께 두면 정치철학이 추상 이론으로만 남지 않고 실제 긴장과 비용을 가진 언어라는 점이 드러난다.",
    ],
  },
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
  title: "철학 기본 시작 경로",
  summary: "지식의 기준을 묻는 질문에서 회의, 존재, 마음의 구조로 이동하는 기본 경로",
  recommendedDepth: "light",
  startTopicSlug: "epistemology",
  path: ["epistemology", "skepticism", "metaphysics", "philosophy-of-mind"],
  bridges: ["philosophy-of-science", "ethics"],
  reasons: [
    "철학 입문에서는 무엇을 안다고 말할 수 있는지부터 잡아 두면 이후 논쟁이 덜 흩어진다.",
    "회의주의와 형이상학을 거치면 개념 정의가 실제 문제를 어떻게 압박하는지 체감할 수 있다.",
    "마음의 철학과 윤리학 브리지는 개인적 질문과 삶의 문제를 함께 열어 준다.",
  ],
};
