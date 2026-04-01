import { RouteView } from "@/components/views/route-view";
import { samplePaths } from "@/lib/data/seed";
import { getTopics } from "@/lib/repository";

export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topics = await getTopics();
  const path = samplePaths.find((item) => item.slug === slug) ?? samplePaths[0];

  return <RouteView path={path} topics={topics} />;
}
