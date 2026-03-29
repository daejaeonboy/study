import { AdminReviewQueueView } from "@/components/views/admin-review-queue-view";
import { requireEditorialUser } from "@/lib/editorial-auth";
import { getAdminTopicRecords, getEditorialUsers, getReviewQueue } from "@/lib/editorial-repository";

export default async function AdminReviewQueuePage() {
  await requireEditorialUser("/admin/review-queue");
  const [tasks, records, users] = await Promise.all([
    getReviewQueue(),
    getAdminTopicRecords(),
    getEditorialUsers(),
  ]);

  return <AdminReviewQueueView tasks={tasks} records={records} users={users} />;
}
