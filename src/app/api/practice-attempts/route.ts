import { ensureAppUserForAuthUser, getAuthenticatedAppAuthUser } from "@/lib/app-auth";
import type { PracticeMode, PracticeSheet } from "@/lib/practice";
import { PracticeSchemaMissingError, savePracticeAttemptForUser } from "@/lib/practice-repository";

function isPracticeMode(value: unknown): value is PracticeMode {
  return value === "light";
}

function isAnswersPayload(value: unknown): value is Record<string, string> {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Object.values(value as Record<string, unknown>).every((item) => typeof item === "string")
  );
}

function isPracticeSheet(value: unknown): value is PracticeSheet {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PracticeSheet>;
  return (
    typeof candidate.topicSlug === "string" &&
    typeof candidate.seed === "string" &&
    Array.isArray(candidate.sections)
  );
}

export async function POST(request: Request) {
  const authUser = await getAuthenticatedAppAuthUser();

  if (!authUser) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    topicSlug?: unknown;
    seed?: unknown;
    mode?: unknown;
    sheet?: unknown;
    answers?: unknown;
  } | null;

  if (
    typeof body?.topicSlug !== "string" ||
    typeof body.seed !== "string" ||
    !isPracticeMode(body.mode) ||
    !isPracticeSheet(body.sheet) ||
    !isAnswersPayload(body.answers)
  ) {
    return Response.json({ error: "Invalid practice attempt payload." }, { status: 400 });
  }

  try {
    await ensureAppUserForAuthUser(authUser);
    const attempt = await savePracticeAttemptForUser({
      userId: authUser.id,
      topicSlug: body.topicSlug,
      seed: body.seed,
      mode: body.mode,
      sheet: body.sheet,
      answers: body.answers,
    });

    return Response.json({ attempt });
  } catch (error) {
    if (error instanceof PracticeSchemaMissingError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Practice attempt save failed." },
      { status: 500 },
    );
  }
}
