import type { LayerDepth } from "@/lib/domain";
import { getApiEditorialUser } from "@/lib/editorial-auth";
import type { PracticeQuestionKind } from "@/lib/practice";
import {
  PracticeSchemaMissingError,
  savePracticeQuestionTemplate,
} from "@/lib/practice-repository";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";

function isLayerDepth(value: unknown): value is LayerDepth {
  return value === "light" || value === "core" || value === "deep";
}

function isQuestionKind(value: unknown): value is PracticeQuestionKind {
  return value === "short_answer" || value === "concept_recall" || value === "application" || value === "bridge";
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
    id?: unknown;
    depth?: unknown;
    kind?: unknown;
    prompt?: unknown;
    guide?: unknown;
    answerLines?: unknown;
    modelAnswer?: unknown;
    rubric?: unknown;
    isActive?: unknown;
  } | null;

  if (
    !isLayerDepth(body?.depth) ||
    !isQuestionKind(body.kind) ||
    typeof body.prompt !== "string" ||
    !body.prompt.trim()
  ) {
    return Response.json({ error: "A valid practice template payload is required." }, { status: 400 });
  }

  try {
    const template = await savePracticeQuestionTemplate({
      actorId: authResult.editorialUser.id,
      template: {
        id: typeof body.id === "string" && body.id ? body.id : undefined,
        topicSlug: slug,
        depth: body.depth,
        kind: body.kind,
        prompt: body.prompt,
        guide: typeof body.guide === "string" ? body.guide : "",
        answerLines:
          typeof body.answerLines === "number" ? Math.min(10, Math.max(2, body.answerLines)) : 4,
        modelAnswer: typeof body.modelAnswer === "string" ? body.modelAnswer : undefined,
        rubric: typeof body.rubric === "string" ? body.rubric : undefined,
        isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      },
    });

    return Response.json({ template });
  } catch (error) {
    if (error instanceof PracticeSchemaMissingError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Practice template save failed." },
      { status: 500 },
    );
  }
}
