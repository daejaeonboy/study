import { AdminTopicsView } from "@/components/views/admin-topics-view";
import { requireEditorialUser } from "@/lib/editorial-auth";
import { getAdminTopicRecords, getEditorialUsers } from "@/lib/editorial-repository";

export default async function AdminTopicsPage() {
  await requireEditorialUser("/admin/topics");
  const [records, users] = await Promise.all([getAdminTopicRecords(), getEditorialUsers()]);

  return <AdminTopicsView records={records} users={users} />;
}
