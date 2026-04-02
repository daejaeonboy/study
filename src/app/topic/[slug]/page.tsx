import { notFound } from "next/navigation";

import { TopicView } from "@/components/views/topic-view";
import { getSessionEditorialUser } from "@/lib/editorial-auth";
import { getTopicBySlug, getTopics } from "@/lib/repository";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [topic, topics, editorialUser] = await Promise.all([
    getTopicBySlug(slug),
    getTopics(),
    getSessionEditorialUser(),
  ]);

  if (!topic) {
    notFound();
  }

  return (
    <TopicView
      topic={topic}
      topics={topics}
      editorialUser={editorialUser}
      remotePersistenceEnabled={hasSupabaseAdminConfig()}
    />
  );
}
