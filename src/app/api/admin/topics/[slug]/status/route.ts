import type { VerificationStatus } from "@/lib/domain";
import { getApiEditorialUser } from "@/lib/editorial-auth";
import { saveTopicVerificationStatus } from "@/lib/editorial-admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";

const allowedStatuses: VerificationStatus[] = [
  "reviewing",
  "verified",
  "published",
  "deprecated",
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
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status =
    typeof body?.status === "string" && allowedStatuses.includes(body.status as VerificationStatus)
      ? (body.status as VerificationStatus)
      : null;

  if (!status) {
    return Response.json({ error: "A valid status is required." }, { status: 400 });
  }

  if (
    (status === "published" || status === "deprecated") &&
    authResult.editorialUser.role !== "admin"
  ) {
    return Response.json({ error: "관리자만 게시 상태를 변경할 수 있습니다." }, { status: 403 });
  }

  try {
    const result = await saveTopicVerificationStatus({
      topicSlug: slug,
      status,
    });

    return Response.json({ result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Status update failed." },
      { status: 500 },
    );
  }
}
