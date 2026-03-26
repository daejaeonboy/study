"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { KnowledgeGraphCanvas } from "@/components/knowledge-graph-canvas";
import { useLibrary } from "@/components/providers/library-provider";
import { defaultDisciplineFromTopicCategory, getDisciplineProfile } from "@/lib/disciplines";
import type { Topic } from "@/lib/domain";

type HomeViewProps = {
  topics: Topic[];
  featuredTopics: Topic[];
  categories: string[];
};

type CanvasSelection = {
  discipline: string;
  stage?: string | null;
  topic?: string | null;
};

export function HomeView({ topics, featuredTopics }: HomeViewProps) {
  const { recentSlugs } = useLibrary();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const recentTopics = recentSlugs
    .map((slug) => topics.find((topic) => topic.slug === slug))
    .filter(Boolean) as Topic[];

  const primaryTopic = recentTopics[0] ?? featuredTopics[0] ?? topics[0];
  const defaultDiscipline = defaultDisciplineFromTopicCategory(primaryTopic.category);
  const defaultMathStage = getDisciplineProfile("수학").stages?.[0]?.level ?? null;
  const selectedDiscipline = searchParams.get("discipline") ?? defaultDiscipline;
  const selectedStage = searchParams.get("stage");
  const selectedTopic = searchParams.get("topic");

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const currentDiscipline = searchParams.get("discipline") ?? defaultDiscipline;
    let shouldReplace = false;

    if (!searchParams.get("discipline")) {
      nextParams.set("discipline", defaultDiscipline);
      shouldReplace = true;
    }

    if (currentDiscipline === "수학" && defaultMathStage && !searchParams.get("stage")) {
      nextParams.set("stage", defaultMathStage);
      shouldReplace = true;
    }

    if (currentDiscipline !== "수학" && (searchParams.get("stage") || searchParams.get("topic"))) {
      nextParams.delete("stage");
      nextParams.delete("topic");
      shouldReplace = true;
    }

    if (shouldReplace) {
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    }
  }, [defaultDiscipline, defaultMathStage, pathname, router, searchParams]);

  function handleSelectNode(selection: CanvasSelection) {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("discipline", selection.discipline);

    if (selection.discipline !== "수학") {
      nextParams.delete("stage");
      nextParams.delete("topic");
    } else {
      if (selection.stage) {
        nextParams.set("stage", selection.stage);
      } else if (defaultMathStage) {
        nextParams.set("stage", defaultMathStage);
      } else {
        nextParams.delete("stage");
      }

      if (selection.topic) {
        nextParams.set("topic", selection.topic);
      } else {
        nextParams.delete("topic");
      }
    }

    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <section className="view graph-home graph-home--viewport">
      <section className="graph-stage-card graph-stage-card--viewport">
        <KnowledgeGraphCanvas
          selectedDiscipline={selectedDiscipline}
          selectedStage={selectedStage}
          selectedTopic={selectedTopic}
          onSelectNode={handleSelectNode}
        />
      </section>
    </section>
  );
}
