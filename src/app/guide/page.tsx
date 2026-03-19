import { GuideView } from "@/components/views/guide-view";
import { getGuidePresets, getGuideRecommendation, getTopics } from "@/lib/repository";

export default async function GuidePage() {
  const [presets, recommendation, topics] = await Promise.all([
    getGuidePresets(),
    getGuideRecommendation("나는 수학 거의 모르는데 블랙홀 이해하고 싶음"),
    getTopics(),
  ]);

  return (
    <GuideView presets={presets} initialRecommendation={recommendation} topics={topics} />
  );
}
