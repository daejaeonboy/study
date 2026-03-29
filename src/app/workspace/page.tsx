import { redirect } from "next/navigation";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  redirect(
    topic
      ? `/admin/topics/${encodeURIComponent(topic)}/edit`
      : "/admin/topics",
  );
}
