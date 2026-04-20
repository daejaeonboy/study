import { notFound } from "next/navigation";

import { PracticeView } from "@/components/views/practice-view";
import { getPracticeQuestionTemplates } from "@/lib/practice-repository";
import { getTopicBySlug } from "@/lib/repository";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [topic, templates] = await Promise.all([
    getTopicBySlug(slug),
    getPracticeQuestionTemplates(slug),
  ]);

  if (!topic) {
    notFound();
  }

  return <PracticeView topic={topic} templates={templates} initialSeed={crypto.randomUUID()} />;
}
