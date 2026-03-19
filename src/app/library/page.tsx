import { LibraryView } from "@/components/views/library-view";
import { getTopics } from "@/lib/repository";

export default async function LibraryPage() {
  const topics = await getTopics();

  return <LibraryView topics={topics} />;
}
