import { notFound } from "next/navigation";

import { TopicView } from "@/components/views/topic-view";
import { getTopicBySlug, getTopics } from "@/lib/repository";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [topic, topics] = await Promise.all([getTopicBySlug(slug), getTopics()]);

  if (!topic) {
    notFound();
  }

  return <TopicView topic={topic} topics={topics} />;
}
