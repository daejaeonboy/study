import { AdminReviewQueueView } from "@/components/views/admin-review-queue-view";
import { requireEditorialUser } from "@/lib/editorial-auth";
import {
  getAdminTopicSummaryRecords,
  getEditorialUsers,
  getReviewQueue,
} from "@/lib/editorial-repository";

export default async function AdminReviewQueuePage() {
  const currentUser = await requireEditorialUser("/admin/review-queue");
  const [tasks, records, users] = await Promise.all([
    getReviewQueue(),
    getAdminTopicSummaryRecords(),
    getEditorialUsers(),
  ]);

  return (
    <AdminReviewQueueView
      currentUser={currentUser}
      tasks={tasks}
      records={records}
      users={users}
    />
  );
}
