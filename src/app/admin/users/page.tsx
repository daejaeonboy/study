import { AdminUsersView } from "@/components/views/admin-users-view";
import { requireEditorialUser } from "@/lib/editorial-auth";
import { getEditorialUsers } from "@/lib/editorial-repository";

export default async function AdminUsersPage() {
  const currentUser = await requireEditorialUser("/admin/users");
  const users = await getEditorialUsers();

  return <AdminUsersView currentUser={currentUser} users={users} />;
}
