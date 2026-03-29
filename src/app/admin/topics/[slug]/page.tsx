import { notFound } from "next/navigation";

import { AdminTopicDetailView } from "@/components/views/admin-topic-detail-view";
import { requireEditorialUser } from "@/lib/editorial-auth";
import { getAdminTopicRecordBySlug, getEditorialUsers } from "@/lib/editorial-repository";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";

export default async function AdminTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await requireEditorialUser(`/admin/topics/${slug}`);
  const [record, users] = await Promise.all([
    getAdminTopicRecordBySlug(slug),
    getEditorialUsers(),
  ]);

  if (!record) {
    notFound();
  }

  return (
    <AdminTopicDetailView
      record={record}
      currentUser={currentUser}
      users={users}
      remotePersistenceEnabled={hasSupabaseAdminConfig()}
    />
  );
}
