import type { Topic } from "@/lib/domain";
import { getApiEditorialUser } from "@/lib/editorial-auth";
import { RevisionConflictError, saveEditorialTopic } from "@/lib/editorial-admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";

function isTopicPayload(value: unknown): value is Topic {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Topic>;

  return (
    typeof candidate.slug === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.summary === "string"
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const authResult = await getApiEditorialUser(["admin", "editor", "reviewer"]);

  if (!authResult.ok) {
    return authResult.response;
  }

  if (!hasSupabaseAdminConfig()) {
    return Response.json(
      { error: "Supabase admin write is not configured yet." },
      { status: 503 },
    );
  }

  const { slug } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    topic?: unknown;
    baseRevision?: unknown;
  } | null;

  if (!isTopicPayload(body?.topic) || body.topic.slug !== slug) {
    return Response.json({ error: "A valid topic payload is required." }, { status: 400 });
  }

  try {
    const topic = await saveEditorialTopic({
      topic: body.topic,
      actorId: authResult.editorialUser.id,
      baseRevision: typeof body?.baseRevision === "number" ? body.baseRevision : undefined,
    });

    return Response.json({ topic });
  } catch (error) {
    if (error instanceof RevisionConflictError) {
      return Response.json(
        {
          error: "A newer revision already exists. Refresh the page before saving again.",
          currentRevision: error.currentRevision,
        },
        { status: 409 },
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Topic save failed." },
      { status: 500 },
    );
  }
}
