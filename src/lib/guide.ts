import type { GuideRecommendation } from "@/lib/domain";
import { defaultGuideRecommendation } from "@/lib/data/seed";

export function resolveGuideRecommendation(query: string): GuideRecommendation {
  const value = query.toLowerCase();

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
      path: ["french-revolution", "democracy"],
      bridges: ["scientific-revolution"],
      reasons: [
        "사건 자체만 보면 읽고 끝나기 쉬워 민주주의 개념으로 바로 연결해야 한다.",
        "역사와 개념을 함께 보면 학습이 더 오래 이어진다.",
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
      bridges: ["democracy"],
      reasons: [
        "과학혁명은 지식 구조가 바뀌는 장면을 보여 줘 전체 프레임을 잡기 좋다.",
        "과학철학은 이론, 데이터, 검증을 정리하는 강한 중간 레이어가 된다.",
      ],
    };
  }

  return defaultGuideRecommendation;
}
