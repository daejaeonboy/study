import { notFound } from "next/navigation";

import { AdminTopicDetailView } from "@/components/views/admin-topic-detail-view";
import { requireEditorialUser } from "@/lib/editorial-auth";
import { getAdminTopicRecordBySlug, getEditorialUsers } from "@/lib/editorial-repository";
import { getPracticeQuestionTemplates } from "@/lib/practice-repository";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";

export default async function AdminTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await requireEditorialUser(`/admin/topics/${slug}`);
  const [record, users, practiceTemplates] = await Promise.all([
    getAdminTopicRecordBySlug(slug),
    getEditorialUsers(),
    getPracticeQuestionTemplates(slug),
  ]);

  if (!record) {
    notFound();
  }

  return (
    <AdminTopicDetailView
      record={record}
      currentUser={currentUser}
      users={users}
      practiceTemplates={practiceTemplates}
      remotePersistenceEnabled={hasSupabaseAdminConfig()}
    />
  );
}
