import type { ReviewTaskStatus } from "@/lib/domain";
import { getApiEditorialUser } from "@/lib/editorial-auth";
import { saveTopicReviewTask } from "@/lib/editorial-admin";
import { getEditorialUserById } from "@/lib/editorial-repository";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";

const reviewStatuses: ReviewTaskStatus[] = [
  "pending",
  "in_review",
  "changes_requested",
  "approved",
];

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const authResult = await getApiEditorialUser(["admin", "reviewer"]);

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
    status?: unknown;
    reviewerId?: unknown;
    comment?: unknown;
  } | null;
  const status =
    typeof body?.status === "string" && reviewStatuses.includes(body.status as ReviewTaskStatus)
      ? (body.status as ReviewTaskStatus)
      : null;

  if (!status) {
    return Response.json({ error: "A valid review status is required." }, { status: 400 });
  }

  const reviewerId =
    typeof body?.reviewerId === "string" && body.reviewerId.length > 0
      ? body.reviewerId
      : authResult.editorialUser.id;
  const reviewer = await getEditorialUserById(reviewerId);

  if (!reviewer) {
    return Response.json({ error: "Unknown reviewer." }, { status: 404 });
  }

  try {
    const task = await saveTopicReviewTask({
      topicSlug: slug,
      status,
      requesterId: authResult.editorialUser.id,
      reviewerId,
      comment: typeof body?.comment === "string" ? body.comment : undefined,
    });

    return Response.json({ task });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Review task save failed." },
      { status: 500 },
    );
  }
}
