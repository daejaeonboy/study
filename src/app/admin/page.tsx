import { AdminDashboardView } from "@/components/views/admin-dashboard-view";
import { requireEditorialUser } from "@/lib/editorial-auth";
import {
  getAdminTopicSummaryRecords,
  getEditorialUsers,
  getReviewQueue,
} from "@/lib/editorial-repository";

export default async function AdminPage() {
  const currentUser = await requireEditorialUser("/admin");
  const [records, reviewQueue, users] = await Promise.all([
    getAdminTopicSummaryRecords(),
    getReviewQueue(),
    getEditorialUsers(),
  ]);

  return (
    <AdminDashboardView
      currentUser={currentUser}
      records={records}
      reviewQueue={reviewQueue}
      users={users}
    />
  );
}
