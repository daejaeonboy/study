import type { LayerDepth } from "@/lib/domain";

export type LibrarySnapshot = {
  savedSlugs: string[];
  recentSlugs: string[];
  notes: Record<string, string>;
  layerProgress: Record<string, LayerDepth>;
};

export type LibraryMutation =
  | {
      type: "toggle-save";
      topicSlug: string;
    }
  | {
      type: "mark-recent";
      topicSlug: string;
    }
  | {
      type: "set-note";
      topicSlug: string;
      value: string;
      depth?: LayerDepth;
    }
  | {
      type: "set-layer-progress";
      topicSlug: string;
      depth: LayerDepth;
    };

export const defaultGuestLibrarySnapshot: LibrarySnapshot = {
  savedSlugs: ["black-hole", "philosophy-of-science"],
  recentSlugs: ["black-hole", "scientific-revolution", "french-revolution"],
  notes: {
    "black-hole":
      "블랙홀은 단독 설명보다 중력 -> 시공간 -> 일반상대성이론 순서가 더 자연스럽다.",
    "french-revolution":
      "사건 연표만 보여주지 말고 민주주의로 넘어가는 다리를 같이 보여줘야 한다.",
  },
  layerProgress: {
    "black-hole": "core",
    "scientific-revolution": "light",
    "french-revolution": "light",
  },
};

export const emptyLibrarySnapshot: LibrarySnapshot = {
  savedSlugs: [],
  recentSlugs: [],
  notes: {},
  layerProgress: {},
};
