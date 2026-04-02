import { AdminTopicsView } from "@/components/views/admin-topics-view";
import { requireEditorialUser } from "@/lib/editorial-auth";
import {
  getAdminTopicSummaryRecords,
  getEditorialUsers,
} from "@/lib/editorial-repository";

export default async function AdminTopicsPage() {
  const currentUser = await requireEditorialUser("/admin/topics");
  const [records, users] = await Promise.all([
    getAdminTopicSummaryRecords(),
    getEditorialUsers(),
  ]);

  return <AdminTopicsView currentUser={currentUser} records={records} users={users} />;
}
