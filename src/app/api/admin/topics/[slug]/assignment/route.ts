import { getApiEditorialUser } from "@/lib/editorial-auth";
import { saveTopicAssignment } from "@/lib/editorial-admin";
import { getEditorialUserById } from "@/lib/editorial-repository";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const authResult = await getApiEditorialUser(["admin"]);

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
    assigneeId?: unknown;
    note?: unknown;
  } | null;
  const assigneeId = typeof body?.assigneeId === "string" ? body.assigneeId : null;

  if (!assigneeId) {
    return Response.json({ error: "assigneeId is required." }, { status: 400 });
  }

  const assignee = await getEditorialUserById(assigneeId);

  if (!assignee) {
    return Response.json({ error: "Unknown assignee." }, { status: 404 });
  }

  try {
    const assignment = await saveTopicAssignment({
      topicSlug: slug,
      assigneeId,
      assignedById: authResult.editorialUser.id,
      note: typeof body?.note === "string" ? body.note : undefined,
    });

    return Response.json({ assignment });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Assignment save failed." },
      { status: 500 },
    );
  }
}
