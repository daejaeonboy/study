import type { GuideRecommendation } from "@/lib/domain";
import { defaultGuideRecommendation } from "@/lib/data/seed";

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

export function resolveGuideRecommendation(query: string): GuideRecommendation {
  const value = query.toLowerCase();

  if (
    includesAny(value, [
      "집합",
      "명제",
      "논리",
      "함수",
      "증명",
      "정의",
      "수학 입문",
      "수학 기초",
      "필요충분",
      "대우",
    ])
  ) {
    return {
      title: "수학의 언어와 논증 입문",
      summary: "집합에서 시작해 명제, 논리, 증명, 함수로 이어지는 수학 기초 경로",
      recommendedDepth: "light",
      startTopicSlug: "set",
      path: ["set", "proposition", "logic", "proof-methods", "function"],
      bridges: ["reading-definitions"],
      reasons: [
        "수학을 처음 읽을 때는 계산보다 무엇을 대상으로 삼고 어떤 문장이 참인지부터 잡아야 한다.",
        "명제와 논리를 먼저 이해하면 정리와 풀이를 읽을 때 무엇이 가정이고 결론인지 덜 헷갈린다.",
        "증명 방식과 함수까지 이어 가면 수학 텍스트를 읽는 최소 문법이 생긴다.",
      ],
    };
  }

  if (value.includes("블랙홀")) {
    return {
      title: "블랙홀 입문 경로",
      summary: "수학 부담을 낮추고 직관에서 이론으로 올라가는 경로",
      recommendedDepth: "light",
      startTopicSlug: "gravity",
      path: ["gravity", "spacetime", "general-relativity", "black-hole"],
      bridges: ["scientific-revolution", "philosophy-of-science"],
      reasons: [
        "블랙홀은 단독 Topic으로 시작하기보다 배경 구조를 먼저 잡는 편이 훨씬 쉽다.",
        "중력과 시공간을 먼저 보면 일반상대성이론이 설명의 다리가 된다.",
        "심화 단계에서는 과학철학 브리지가 연구 관점을 열어 준다.",
      ],
    };
  }

  if (value.includes("프랑스") || value.includes("혁명")) {
    return {
      title: "프랑스 혁명에서 정치철학까지",
      summary: "사건사로 시작해 개념과 정당성 문제로 이동하는 경로",
      recommendedDepth: "light",
      startTopicSlug: "french-revolution",
      path: ["french-revolution", "political-philosophy", "democracy"],
      bridges: ["ethics"],
      reasons: [
        "프랑스 혁명은 사건사만 읽으면 흩어지기 쉬워 정치철학 언어로 다시 묶는 편이 좋다.",
        "정치철학을 거치면 자유, 권리, 평등이 어떤 정당성 구조를 가지는지 더 또렷해진다.",
        "민주주의까지 이어 가면 역사적 사건이 실제 제도 원리로 어떻게 번역되는지 볼 수 있다.",
      ],
    };
  }

  if (
    includesAny(value, [
      "수학",
      "집합",
      "명제",
      "논리",
      "함수",
      "증명",
      "정의를 읽는 법",
      "필요충분",
      "조건",
    ])
  ) {
    return {
      title: "수학 언어와 논증 입문 경로",
      summary: "집합에서 시작해 명제, 논리, 증명, 함수로 이어지는 수학 1단계 기초 경로",
      recommendedDepth: "light",
      startTopicSlug: "set",
      path: ["set", "proposition", "logic", "proof-methods", "function"],
      bridges: ["reading-definitions"],
      reasons: [
        "집합은 무엇을 하나의 대상으로 볼지 정하는 출발점이라 이후 모든 기호 읽기의 바탕이 된다.",
        "명제와 논리를 먼저 잡아 두면 조건문, 대우, 필요충분조건을 읽을 때 덜 흔들린다.",
        "증명 방식과 정의 읽기를 함께 보면 수학이 계산이 아니라 문장과 구조의 학문이라는 점이 분명해진다.",
      ],
    };
  }

  if (value.includes("과학혁명") || value.includes("과학철학") || value.includes("연구")) {
    return {
      title: "과학사에서 연구 구조로 확장",
      summary: "과학혁명에서 과학철학과 현대 물리학으로 이동하는 경로",
      recommendedDepth: "core",
      startTopicSlug: "scientific-revolution",
      path: ["scientific-revolution", "philosophy-of-science", "general-relativity", "black-hole"],
      bridges: ["epistemology"],
      reasons: [
        "과학혁명은 지식 구조가 바뀌는 장면을 보여 줘 전체 프레임을 잡기 좋다.",
        "과학철학은 이론, 데이터, 검증을 정리하는 강한 중간 레이어가 된다.",
        "인식론 브리지를 함께 보면 과학 지식의 정당화 문제가 철학 전체와 어떻게 이어지는지도 보인다.",
      ],
    };
  }

  if (
    includesAny(value, [
      "윤리",
      "도덕",
      "선",
      "행복",
      "덕",
      "책임",
      "의무",
      "정의",
      "권리",
      "평등",
      "자유",
      "공동체",
      "정치철학",
      "민주주의",
      "시민",
    ])
  ) {
    return {
      title: "윤리학에서 정치철학으로 가는 경로",
      summary: "개인의 옳음에서 권리, 정의, 제도 정당성으로 확장하는 철학 경로",
      recommendedDepth: "light",
      startTopicSlug: "ethics",
      path: ["ethics", "political-philosophy", "democracy"],
      bridges: ["french-revolution"],
      reasons: [
        "윤리학을 먼저 보면 판단 기준이 무엇인지 잡은 뒤 정치철학으로 넘어갈 수 있다.",
        "정치철학은 자유, 권리, 평등 같은 개념을 제도 정당성 문제로 묶어 준다.",
        "민주주의와 프랑스 혁명은 철학 개념이 실제 공적 삶에서 어떻게 구현되는지 보여 준다.",
      ],
    };
  }

  if (
    includesAny(value, [
      "마음",
      "의식",
      "자아",
      "자유의지",
      "결정론",
      "퀄리아",
      "환원",
      "심신",
      "뇌",
      "형이상학",
      "존재",
      "실재",
      "동일성",
    ])
  ) {
    return {
      title: "형이상학에서 마음의 철학으로 가는 경로",
      summary: "세계의 구조 질문에서 의식, 자아, 심신 문제로 이동하는 철학 경로",
      recommendedDepth: "core",
      startTopicSlug: "metaphysics",
      path: ["metaphysics", "philosophy-of-mind", "ethics"],
      bridges: ["philosophy-of-science"],
      reasons: [
        "형이상학이 존재와 동일성의 기본 구조를 먼저 잡아 주면 마음의 철학 논쟁이 훨씬 또렷해진다.",
        "마음의 철학은 심신 문제와 의식을 실제 논쟁 형태로 보여 주는 대표 입문 지점이다.",
        "윤리학까지 이어 가면 인간을 어떤 존재로 보는지가 책임과 판단 문제로 연결된다.",
      ],
    };
  }

  if (
    includesAny(value, [
      "철학",
      "인식론",
      "지식",
      "진리",
      "증거",
      "참",
      "게티어",
      "확실성",
      "정당화",
      "회의주의",
      "회의",
      "회의론",
      "알 수",
      "믿음",
      "근거",
    ])
  ) {
    return {
      title: "인식론에서 철학 핵심 질문으로",
      summary: "지식의 기준에서 시작해 회의주의, 형이상학, 마음의 철학으로 확장하는 경로",
      recommendedDepth: "light",
      startTopicSlug: "epistemology",
      path: ["epistemology", "skepticism", "metaphysics", "philosophy-of-mind"],
      bridges: ["philosophy-of-science"],
      reasons: [
        "철학 입문에서는 무엇을 안다고 말할 수 있는지부터 잡아야 이후 논쟁이 덜 흩어진다.",
        "회의주의를 거치면 인식론이 실제로 어떤 압박을 받는지 바로 체감할 수 있다.",
        "형이상학과 마음의 철학으로 이어지면 지식 문제를 세계와 자아의 구조 문제로 확장할 수 있다.",
      ],
    };
  }

  return defaultGuideRecommendation;
}
