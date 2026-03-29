import { ensureAppUserForAuthUser, getAuthenticatedAppAuthUser } from "@/lib/app-auth";
import {
  applyLibraryMutationForUser,
  getLibrarySnapshotForUser,
} from "@/lib/library-repository";
import type { LibraryMutation } from "@/lib/library-state";

function isLayerDepth(value: unknown): value is "light" | "core" | "deep" {
  return value === "light" || value === "core" || value === "deep";
}

function parseMutation(payload: unknown): LibraryMutation | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  const topicSlug = typeof candidate.topicSlug === "string" ? candidate.topicSlug.trim() : "";

  if (!topicSlug) {
    return null;
  }

  switch (candidate.type) {
    case "toggle-save":
      return {
        type: "toggle-save",
        topicSlug,
      };
    case "mark-recent":
      return {
        type: "mark-recent",
        topicSlug,
      };
    case "set-note":
      return {
        type: "set-note",
        topicSlug,
        value: typeof candidate.value === "string" ? candidate.value : "",
        depth: isLayerDepth(candidate.depth) ? candidate.depth : undefined,
      };
    case "set-layer-progress":
      if (!isLayerDepth(candidate.depth)) {
        return null;
      }

      return {
        type: "set-layer-progress",
        topicSlug,
        depth: candidate.depth,
      };
    default:
      return null;
  }
}

export async function GET() {
  const authUser = await getAuthenticatedAppAuthUser();

  if (!authUser) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    await ensureAppUserForAuthUser(authUser);
    const snapshot = await getLibrarySnapshotForUser(authUser.id);
    return Response.json(snapshot);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to load library snapshot.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authUser = await getAuthenticatedAppAuthUser();

  if (!authUser) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const mutation = parseMutation(payload);

  if (!mutation) {
    return Response.json({ error: "Invalid library mutation." }, { status: 400 });
  }

  try {
    await ensureAppUserForAuthUser(authUser);
    const snapshot = await applyLibraryMutationForUser(authUser.id, mutation);
    return Response.json(snapshot);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to update library snapshot.",
      },
      { status: 500 },
    );
  }
}
