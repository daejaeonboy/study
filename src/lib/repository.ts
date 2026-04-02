import {
  defaultGuideRecommendation,
  featuredTopicSlugs,
  guidePresets,
  samplePaths,
  workspaces,
} from "@/lib/data/seed";
import type {
  AdminTopicSummary,
  GuidePreset,
  GuideRecommendation,
  LearningPath,
  Topic,
  TopicBundle,
  VerificationStatus,
  Workspace,
} from "@/lib/domain";
import { materializeTopic, topicBundles } from "@/content/topic-bundles";
import { resolveGuideRecommendation } from "@/lib/guide";
import { createSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

type SupabaseTopicRow = {
  slug?: string | null;
  title?: string | null;
  summary?: string | null;
  importance_reason?: string | null;
  category?: string | null;
  tags?: unknown;
  verification_status?: VerificationStatus | null;
  source_origin?: string | null;
  revision?: number | null;
  imported_at?: string | null;
  last_reviewed_at?: string | null;
  editorial_summary?: string | null;
};

type SupabaseBundleRevisionRow = {
  topic_slug?: string | null;
  revision?: number | null;
  verification_status?: VerificationStatus | null;
  source_origin?: string | null;
  editorial_summary?: string | null;
  bundle_payload?: unknown;
  imported_at?: string | null;
  last_reviewed_at?: string | null;
};

type SupabaseTopicSummaryRow = {
  slug?: string | null;
  title?: string | null;
  summary?: string | null;
  category?: string | null;
  tags?: unknown;
  verification_status?: VerificationStatus | null;
  revision?: number | null;
  imported_at?: string | null;
  last_reviewed_at?: string | null;
  editorial_summary?: string | null;
};

function normalizeTopicTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }

  return [];
}

function mapBundleToSummary(bundle: TopicBundle): AdminTopicSummary {
  return {
    slug: bundle.topic.slug,
    title: bundle.topic.title,
    summary: bundle.topic.summary,
    category: bundle.topic.category,
    tags: bundle.topic.tags,
    verificationStatus: bundle.review.verificationStatus,
    revision: bundle.review.revision,
    importedAt: bundle.review.importedAt,
    lastReviewedAt: bundle.review.lastReviewedAt,
    editorialSummary: bundle.review.editorialSummary,
  };
}

function mapTopicRowToSummary(row: SupabaseTopicSummaryRow): AdminTopicSummary | null {
  if (
    typeof row.slug !== "string" ||
    typeof row.title !== "string" ||
    typeof row.summary !== "string" ||
    typeof row.category !== "string"
  ) {
    return null;
  }

  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category,
    tags: normalizeTopicTags(row.tags),
    verificationStatus: row.verification_status ?? undefined,
    revision: row.revision ?? undefined,
    importedAt: row.imported_at ?? undefined,
    lastReviewedAt: row.last_reviewed_at ?? undefined,
    editorialSummary: row.editorial_summary?.trim() || undefined,
  };
}

function getSupabaseReadClient() {
  if (hasSupabaseAdminConfig()) {
    return createSupabaseAdminClient();
  }

  if (hasSupabaseConfig()) {
    return createSupabaseClient();
  }

  return null;
}

function getSeedTopicBundleBySlug(slug: string) {
  return topicBundles.find((bundle) => bundle.topic.slug === slug) ?? null;
}

function getSeedTopicSummaryBySlug(slug: string) {
  const bundle = getSeedTopicBundleBySlug(slug);
  return bundle ? mapBundleToSummary(bundle) : null;
}

function normalizeTopicBundle(payload: unknown): TopicBundle | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Partial<TopicBundle>;

  if (
    !candidate.topic ||
    typeof candidate.topic !== "object" ||
    !candidate.review ||
    typeof candidate.review !== "object"
  ) {
    return null;
  }

  const maybeSlug = (candidate.topic as { slug?: unknown }).slug;

  if (typeof maybeSlug !== "string" || maybeSlug.length === 0) {
    return null;
  }

  return candidate as TopicBundle;
}

function mergeTopicRowIntoBundle(bundle: TopicBundle, remote: SupabaseTopicRow): TopicBundle {
  const normalizedTags = normalizeTopicTags(remote.tags);

  return {
    topic: {
      ...bundle.topic,
      title: remote.title?.trim() || bundle.topic.title,
      summary: remote.summary?.trim() || bundle.topic.summary,
      importance: remote.importance_reason?.trim() || bundle.topic.importance,
      category: remote.category?.trim() || bundle.topic.category,
      tags: normalizedTags.length ? normalizedTags : bundle.topic.tags,
    },
    review: {
      ...bundle.review,
      verificationStatus: remote.verification_status ?? bundle.review.verificationStatus,
      sourceOrigin: remote.source_origin?.trim() || bundle.review.sourceOrigin,
      revision: remote.revision ?? bundle.review.revision,
      importedAt: remote.imported_at ?? bundle.review.importedAt,
      lastReviewedAt: remote.last_reviewed_at ?? bundle.review.lastReviewedAt,
      editorialSummary: remote.editorial_summary?.trim() || bundle.review.editorialSummary,
    },
  };
}

function mergeRevisionRowIntoBundle(
  bundle: TopicBundle,
  revisionRow: SupabaseBundleRevisionRow,
): TopicBundle {
  return {
    ...bundle,
    review: {
      ...bundle.review,
      verificationStatus: revisionRow.verification_status ?? bundle.review.verificationStatus,
      sourceOrigin: revisionRow.source_origin?.trim() || bundle.review.sourceOrigin,
      revision: revisionRow.revision ?? bundle.review.revision,
      importedAt: revisionRow.imported_at ?? bundle.review.importedAt,
      lastReviewedAt: revisionRow.last_reviewed_at ?? bundle.review.lastReviewedAt,
      editorialSummary: revisionRow.editorial_summary?.trim() || bundle.review.editorialSummary,
    },
  };
}

function mergeRemoteBundles(
  remoteTopics: SupabaseTopicRow[],
  remoteBundleRows: SupabaseBundleRevisionRow[],
): TopicBundle[] {
  const bundleMap = new Map(topicBundles.map((bundle) => [bundle.topic.slug, bundle]));
  const latestBundleRows = new Map<string, SupabaseBundleRevisionRow>();

  remoteBundleRows.forEach((row) => {
    if (typeof row.topic_slug !== "string" || latestBundleRows.has(row.topic_slug)) {
      return;
    }

    latestBundleRows.set(row.topic_slug, row);
  });

  latestBundleRows.forEach((row, slug) => {
    const parsedBundle = normalizeTopicBundle(row.bundle_payload);

    if (!parsedBundle) {
      return;
    }

    bundleMap.set(slug, mergeRevisionRowIntoBundle(parsedBundle, row));
  });

  remoteTopics.forEach((row) => {
    if (typeof row.slug !== "string") {
      return;
    }

    const existing = bundleMap.get(row.slug);

    if (!existing) {
      return;
    }

    bundleMap.set(row.slug, mergeTopicRowIntoBundle(existing, row));
  });

  return Array.from(bundleMap.values());
}

async function getTopicBundleBySlugFromSupabase(slug: string): Promise<TopicBundle | null> {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return getSeedTopicBundleBySlug(slug);
  }

  const [topicResult, revisionResult] = await Promise.all([
    supabase
      .from("topics")
      .select(
        "slug, title, summary, importance_reason, category, tags, verification_status, source_origin, revision, imported_at, last_reviewed_at, editorial_summary",
      )
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("topic_bundle_revisions")
      .select(
        "topic_slug, revision, verification_status, source_origin, editorial_summary, bundle_payload, imported_at, last_reviewed_at",
      )
      .eq("topic_slug", slug)
      .order("revision", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const topicRow = topicResult.data as SupabaseTopicRow | null;
  const revisionRow = revisionResult.data as SupabaseBundleRevisionRow | null;
  const seedBundle = getSeedTopicBundleBySlug(slug);
  const parsedBundle = revisionRow ? normalizeTopicBundle(revisionRow.bundle_payload) : null;
  const baseBundle = parsedBundle ?? seedBundle;

  if (!baseBundle) {
    return null;
  }

  let nextBundle = revisionRow && parsedBundle ? mergeRevisionRowIntoBundle(parsedBundle, revisionRow) : baseBundle;

  if (topicRow) {
    nextBundle = mergeTopicRowIntoBundle(nextBundle, topicRow);
  }

  return nextBundle;
}

export async function getTopicBundles(): Promise<TopicBundle[]> {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return topicBundles;
  }

  const [{ data: topicRows, error: topicError }, { data: revisionRows, error: revisionError }] =
    await Promise.all([
      supabase
        .from("topics")
        .select(
          "slug, title, summary, importance_reason, category, tags, verification_status, source_origin, revision, imported_at, last_reviewed_at, editorial_summary",
        )
        .order("title", { ascending: true }),
      supabase
        .from("topic_bundle_revisions")
        .select(
          "topic_slug, revision, verification_status, source_origin, editorial_summary, bundle_payload, imported_at, last_reviewed_at",
        )
        .order("topic_slug", { ascending: true })
        .order("revision", { ascending: false }),
    ]);

  if (topicError && revisionError) {
    return topicBundles;
  }

  return mergeRemoteBundles(
    (topicRows as SupabaseTopicRow[] | null) ?? [],
    (revisionRows as SupabaseBundleRevisionRow[] | null) ?? [],
  );
}

export async function getTopics(): Promise<Topic[]> {
  const bundles = await getTopicBundles();
  return bundles.map(materializeTopic);
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const bundle = await getTopicBundleBySlugFromSupabase(slug);
  return bundle ? materializeTopic(bundle) : null;
}

export async function getTopicSummaryBySlug(slug: string): Promise<AdminTopicSummary | null> {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return getSeedTopicSummaryBySlug(slug);
  }

  const { data, error } = await supabase
    .from("topics")
    .select("slug, title, summary, category, tags, verification_status, revision, imported_at, last_reviewed_at, editorial_summary")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return getSeedTopicSummaryBySlug(slug);
  }

  return mapTopicRowToSummary(data as SupabaseTopicSummaryRow);
}

export async function getTopicSummaries(): Promise<AdminTopicSummary[]> {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return topicBundles.map(mapBundleToSummary);
  }

  const { data, error } = await supabase
    .from("topics")
    .select(
      "slug, title, summary, category, tags, verification_status, revision, imported_at, last_reviewed_at, editorial_summary",
    )
    .order("title", { ascending: true });

  if (error || !data?.length) {
    return topicBundles.map(mapBundleToSummary);
  }

  return (data as SupabaseTopicSummaryRow[])
    .map(mapTopicRowToSummary)
    .filter((item): item is AdminTopicSummary => Boolean(item));
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
  const allTopics = await getTopics();
  const map = new Map(allTopics.map((topic) => [topic.slug, topic]));
  const match = samplePaths.find((path) => path.slug === slug);
  if (match) {
    return match;
  }

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
