import type { LayerDepth } from "@/lib/domain";

export function formatDepth(depth: LayerDepth) {
  return { light: "Light", core: "Core", deep: "Deep" }[depth] ?? depth;
}
