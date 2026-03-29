import { notFound } from "next/navigation";

import { EditorialWorkspaceView } from "@/components/views/editorial-workspace-view";
import { requireEditorialUser } from "@/lib/editorial-auth";
import { getTopicBySlug } from "@/lib/repository";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";

export default async function AdminTopicEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await requireEditorialUser(`/admin/topics/${slug}/edit`);
  const topic = await getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  return (
    <EditorialWorkspaceView
      topics={[topic]}
      initialTopicSlug={slug}
      currentUser={currentUser}
      remotePersistenceEnabled={hasSupabaseAdminConfig()}
      variant="topic-edit"
      backHref={`/admin/topics/${slug}`}
      backLabel="운영 상세로 돌아가기"
    />
  );
}
