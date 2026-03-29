import { LibraryView } from "@/components/views/library-view";
import { requireAppUser } from "@/lib/app-auth";
import { getTopics } from "@/lib/repository";

export default async function LibraryPage() {
  const [appUser, topics] = await Promise.all([requireAppUser("/library"), getTopics()]);

  return <LibraryView topics={topics} user={appUser} />;
}
