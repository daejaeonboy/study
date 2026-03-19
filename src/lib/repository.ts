import {
  defaultGuideRecommendation,
  featuredTopicSlugs,
  guidePresets,
  samplePaths,
  topics,
  workspaces,
} from "@/lib/data/seed";
import type {
  GuidePreset,
  GuideRecommendation,
  LearningPath,
  Topic,
  Workspace,
} from "@/lib/domain";
import { resolveGuideRecommendation } from "@/lib/guide";
import { createSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";

function topicMap() {
  return new Map(topics.map((topic) => [topic.slug, topic]));
}

type SupabaseTopicRow = {
  slug?: string | null;
  title?: string | null;
  summary?: string | null;
  importance_reason?: string | null;
  category?: string | null;
  tags?: unknown;
};

function normalizeTopicTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }

  return [];
}

function mergeRemoteTopics(remoteTopics: SupabaseTopicRow[]): Topic[] {
  const bySlug = new Map(
    remoteTopics
      .filter((topic): topic is Required<Pick<SupabaseTopicRow, "slug">> & SupabaseTopicRow =>
        typeof topic.slug === "string" && topic.slug.length > 0,
      )
      .map((topic) => [topic.slug, topic]),
  );

  return topics.map((topic) => {
    const remote = bySlug.get(topic.slug);

    if (!remote) {
      return topic;
    }

    return {
      ...topic,
      title: remote.title?.trim() || topic.title,
      summary: remote.summary?.trim() || topic.summary,
      importance: remote.importance_reason?.trim() || topic.importance,
      category: remote.category?.trim() || topic.category,
      tags: normalizeTopicTags(remote.tags).length ? normalizeTopicTags(remote.tags) : topic.tags,
    };
  });
}

export async function getTopics(): Promise<Topic[]> {
  if (hasSupabaseConfig()) {
    const supabase = createSupabaseClient();
    if (!supabase) {
      return topics;
    }

    const { data, error } = await supabase
      .from("topics")
      .select("slug, title, summary, importance_reason, category, tags")
      .order("title", { ascending: true });

    if (!error && data?.length) {
      return mergeRemoteTopics(data as SupabaseTopicRow[]);
    }
  }

  return topics;
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const allTopics = await getTopics();
  return allTopics.find((topic) => topic.slug === slug) ?? null;
}

export async function getFeaturedTopics(): Promise<Topic[]> {
  const allTopics = await getTopics();
  const bySlug = new Map(allTopics.map((topic) => [topic.slug, topic]));
  return featuredTopicSlugs.map((slug) => bySlug.get(slug)).filter(Boolean) as Topic[];
}

export async function getCategories(): Promise<string[]> {
  const allTopics = await getTopics();
  return [...new Set(allTopics.map((topic) => topic.category))];
}

export async function getLearningPath(slug: string): Promise<LearningPath> {
  const match = samplePaths.find((path) => path.slug === slug);
  if (match) {
    return match;
  }

  const map = topicMap();
  const topic = map.get(slug);

  if (!topic) {
    return samplePaths[0];
  }

  return {
    slug,
    title: `${topic.title} 탐험 경로`,
    goal: "현재 Topic에서 다음 학습 흐름으로 이어지기",
    startTopicSlug: topic.prerequisites[0] ?? topic.slug,
    currentTopicSlug: topic.slug,
    nextTopicSlugs: topic.related.slice(0, 2),
    steps: [
      ...topic.prerequisites.slice(0, 2).map((topicSlug) => ({
        topicSlug,
        depth: "light" as const,
        status: "completed" as const,
        note: "선수지식으로 먼저 보기",
      })),
      {
        topicSlug: topic.slug,
        depth: "light" as const,
        status: "current" as const,
        note: "현재 보고 있는 Topic",
      },
      ...topic.related.slice(0, 2).map((topicSlug) => ({
        topicSlug,
        depth: "core" as const,
        status: "suggested" as const,
        note: "다음으로 이어 볼 Topic",
      })),
    ],
  };
}

export async function getGuidePresets(): Promise<GuidePreset[]> {
  return guidePresets;
}

export async function getGuideRecommendation(query?: string): Promise<GuideRecommendation> {
  if (!query?.trim()) {
    return defaultGuideRecommendation;
  }

  return resolveGuideRecommendation(query);
}

export async function getWorkspace(slug = "black-hole-bridge"): Promise<Workspace | null> {
  return workspaces.find((workspace) => workspace.slug === slug) ?? null;
}
