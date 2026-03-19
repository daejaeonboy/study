import { notFound } from "next/navigation";

import { RouteView } from "@/components/views/route-view";
import { getLearningPath, getTopicBySlug, getTopics } from "@/lib/repository";

export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [topic, path, topics] = await Promise.all([
    getTopicBySlug(slug),
    getLearningPath(slug),
    getTopics(),
  ]);

  if (!topic) {
    notFound();
  }

  return <RouteView path={path} topics={topics} />;
}
