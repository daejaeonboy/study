import type { LayerDepth } from "@/lib/domain";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";
import { ensureAppUserForAuthUser, getAuthenticatedAppAuthUser } from "@/lib/app-auth";
import {
  defaultGuestLibrarySnapshot,
  emptyLibrarySnapshot,
  type LibraryMutation,
  type LibrarySnapshot,
} from "@/lib/library-state";

type TopicLookupRow = {
  id?: string | null;
  slug?: string | null;
};

type BookmarkRow = {
  topic_id?: string | null;
  created_at?: string | null;
};

type NoteRow = {
  topic_id?: string | null;
  content?: string | null;
  updated_at?: string | null;
};

type ProgressRow = {
  topic_id?: string | null;
  last_viewed_layer?: LayerDepth | null;
  viewed_layers?: unknown;
  last_viewed_at?: string | null;
};

function getLibraryAdminClient() {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  return createSupabaseAdminClient();
}

function normalizeViewedLayers(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is LayerDepth => item === "light" || item === "core" || item === "deep",
  );
}

function getCompletionScore(depths: LayerDepth[]) {
  if (depths.includes("deep")) {
    return 100;
  }

  if (depths.includes("core")) {
    return 66.67;
  }

  if (depths.includes("light")) {
    return 33.33;
  }

  return 0;
}

async function getTopicIdBySlug(topicSlug: string) {
  const supabase = getLibraryAdminClient();

  if (!supabase) {
    throw new Error("Library sync backend is not configured.");
  }

  const { data, error } = await supabase
    .from("topics")
    .select("id")
    .eq("slug", topicSlug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const topicId = (data as { id?: string | null } | null)?.id;

  if (!topicId) {
    throw new Error(`Unknown topic slug: ${topicSlug}`);
  }

  return topicId;
}

async function getSlugMapForTopicIds(topicIds: string[]) {
  const supabase = getLibraryAdminClient();

  if (!supabase || !topicIds.length) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("topics")
    .select("id, slug")
    .in("id", topicIds);

  if (error) {
    throw error;
  }

  return new Map(
    ((data as TopicLookupRow[] | null) ?? [])
      .filter((row): row is Required<TopicLookupRow> => Boolean(row.id && row.slug))
      .map((row) => [row.id, row.slug]),
  );
}

async function upsertUserProgress(userId: string, topicSlug: string, depth?: LayerDepth) {
  const supabase = getLibraryAdminClient();

  if (!supabase) {
    throw new Error("Library sync backend is not configured.");
  }

  const topicId = await getTopicIdBySlug(topicSlug);
  const { data, error } = await supabase
    .from("user_progress")
    .select("last_viewed_layer, viewed_layers")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const existing = (data as { last_viewed_layer?: LayerDepth | null; viewed_layers?: unknown } | null) ?? null;
  const nextDepth = depth ?? existing?.last_viewed_layer ?? "light";
  const viewedLayers = new Set<LayerDepth>(normalizeViewedLayers(existing?.viewed_layers));
  viewedLayers.add(nextDepth);

  const payload = {
    user_id: userId,
    topic_id: topicId,
    last_viewed_layer: nextDepth,
    viewed_layers: Array.from(viewedLayers),
    completion_score: getCompletionScore(Array.from(viewedLayers)),
    last_viewed_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase.from("user_progress").upsert(payload, {
    onConflict: "user_id,topic_id",
  });

  if (upsertError) {
    throw upsertError;
  }
}

async function toggleUserBookmark(userId: string, topicSlug: string) {
  const supabase = getLibraryAdminClient();

  if (!supabase) {
    throw new Error("Library sync backend is not configured.");
  }

  const topicId = await getTopicIdBySlug(topicSlug);
  const { data, error } = await supabase
    .from("user_bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if ((data as { id?: string | null } | null)?.id) {
    const { error: deleteError } = await supabase
      .from("user_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("topic_id", topicId);

    if (deleteError) {
      throw deleteError;
    }

    return;
  }

  const { error: insertError } = await supabase.from("user_bookmarks").insert({
    user_id: userId,
    topic_id: topicId,
  });

  if (insertError) {
    throw insertError;
  }
}

async function setUserNote(
  userId: string,
  topicSlug: string,
  value: string,
  depth?: LayerDepth,
) {
  const supabase = getLibraryAdminClient();

  if (!supabase) {
    throw new Error("Library sync backend is not configured.");
  }

  const topicId = await getTopicIdBySlug(topicSlug);
  const trimmedValue = value.trim();

  const { error: deleteError } = await supabase
    .from("user_notes")
    .delete()
    .eq("user_id", userId)
    .eq("topic_id", topicId);

  if (deleteError) {
    throw deleteError;
  }

  if (!trimmedValue) {
    return;
  }

  const { error: insertError } = await supabase.from("user_notes").insert({
    user_id: userId,
    topic_id: topicId,
    layer_depth: depth ?? null,
    content: trimmedValue,
  });

  if (insertError) {
    throw insertError;
  }
}

export async function getLibrarySnapshotForUser(userId: string): Promise<LibrarySnapshot> {
  const supabase = getLibraryAdminClient();

  if (!supabase) {
    return emptyLibrarySnapshot;
  }

  const [
    { data: bookmarkRows, error: bookmarkError },
    { data: noteRows, error: noteError },
    { data: progressRows, error: progressError },
  ] = await Promise.all([
    supabase
      .from("user_bookmarks")
      .select("topic_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_notes")
      .select("topic_id, content, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("user_progress")
      .select("topic_id, last_viewed_layer, viewed_layers, last_viewed_at")
      .eq("user_id", userId)
      .order("last_viewed_at", { ascending: false }),
  ]);

  if (bookmarkError) {
    throw bookmarkError;
  }

  if (noteError) {
    throw noteError;
  }

  if (progressError) {
    throw progressError;
  }

  const topicIds = new Set<string>();

  ((bookmarkRows as BookmarkRow[] | null) ?? []).forEach((row) => {
    if (row.topic_id) {
      topicIds.add(row.topic_id);
    }
  });

  ((noteRows as NoteRow[] | null) ?? []).forEach((row) => {
    if (row.topic_id) {
      topicIds.add(row.topic_id);
    }
  });

  ((progressRows as ProgressRow[] | null) ?? []).forEach((row) => {
    if (row.topic_id) {
      topicIds.add(row.topic_id);
    }
  });

  const slugMap = await getSlugMapForTopicIds(Array.from(topicIds));
  const notes: Record<string, string> = {};
  const layerProgress: Record<string, LayerDepth> = {};
  const savedSlugs = ((bookmarkRows as BookmarkRow[] | null) ?? [])
    .map((row) => (row.topic_id ? slugMap.get(row.topic_id) : null))
    .filter((slug): slug is string => Boolean(slug));
  const recentSlugs = ((progressRows as ProgressRow[] | null) ?? [])
    .map((row) => (row.topic_id ? slugMap.get(row.topic_id) : null))
    .filter((slug): slug is string => Boolean(slug))
    .slice(0, 6);

  ((noteRows as NoteRow[] | null) ?? []).forEach((row) => {
    if (!row.topic_id || typeof row.content !== "string") {
      return;
    }

    const slug = slugMap.get(row.topic_id);

    if (!slug || notes[slug]) {
      return;
    }

    notes[slug] = row.content;
  });

  ((progressRows as ProgressRow[] | null) ?? []).forEach((row) => {
    if (!row.topic_id || !row.last_viewed_layer) {
      return;
    }

    const slug = slugMap.get(row.topic_id);

    if (!slug) {
      return;
    }

    layerProgress[slug] = row.last_viewed_layer;
  });

  return {
    savedSlugs,
    recentSlugs,
    notes,
    layerProgress,
  };
}

export async function getSessionLibrarySnapshot() {
  const authUser = await getAuthenticatedAppAuthUser();

  if (!authUser) {
    return defaultGuestLibrarySnapshot;
  }

  await ensureAppUserForAuthUser(authUser);
  return getLibrarySnapshotForUser(authUser.id);
}

export async function applyLibraryMutationForUser(
  userId: string,
  mutation: LibraryMutation,
) {
  switch (mutation.type) {
    case "toggle-save":
      await toggleUserBookmark(userId, mutation.topicSlug);
      break;
    case "mark-recent":
      await upsertUserProgress(userId, mutation.topicSlug);
      break;
    case "set-note":
      await setUserNote(userId, mutation.topicSlug, mutation.value, mutation.depth);
      break;
    case "set-layer-progress":
      await upsertUserProgress(userId, mutation.topicSlug, mutation.depth);
      break;
    default:
      throw new Error("Unknown library mutation.");
  }

  return getLibrarySnapshotForUser(userId);
}
