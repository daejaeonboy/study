import type { LayerDepth } from "@/lib/domain";
import type {
  PracticeMode,
  PracticeQuestionKind,
  PracticeQuestionTemplate,
  PracticeSheet,
} from "@/lib/practice";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

type PracticeTemplateRow = {
  id?: string | null;
  topic_slug?: string | null;
  depth?: LayerDepth | null;
  kind?: PracticeQuestionKind | null;
  prompt?: string | null;
  guide?: string | null;
  answer_lines?: number | null;
  model_answer?: string | null;
  rubric?: string | null;
  is_active?: boolean | null;
};

export class PracticeSchemaMissingError extends Error {
  constructor(message = "Practice storage schema is not applied.") {
    super(message);
    this.name = "PracticeSchemaMissingError";
  }
}

function getPracticeAdminClient() {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  return createSupabaseAdminClient();
}

function isMissingPracticeSchema(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  return error?.code === "42P01" || message.includes("practice_") || message.includes("does not exist");
}

function normalizeTemplateRow(row: PracticeTemplateRow): PracticeQuestionTemplate | null {
  if (
    typeof row.id !== "string" ||
    typeof row.topic_slug !== "string" ||
    !["light", "core", "deep"].includes(row.depth ?? "") ||
    !["short_answer", "concept_recall", "application", "bridge"].includes(row.kind ?? "") ||
    typeof row.prompt !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    topicSlug: row.topic_slug,
    depth: row.depth as LayerDepth,
    kind: row.kind as PracticeQuestionKind,
    prompt: row.prompt,
    guide: row.guide ?? "",
    answerLines: row.answer_lines ?? 4,
    modelAnswer: row.model_answer ?? undefined,
    rubric: row.rubric ?? undefined,
    isActive: row.is_active ?? true,
  };
}

async function getTopicIdBySlug(topicSlug: string) {
  const supabase = getPracticeAdminClient();

  if (!supabase) {
    throw new Error("Practice storage backend is not configured.");
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

export async function getPracticeQuestionTemplates(topicSlug: string) {
  const supabase = getPracticeAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("practice_question_templates")
    .select(
      "id, topic_slug, depth, kind, prompt, guide, answer_lines, model_answer, rubric, is_active",
    )
    .eq("topic_slug", topicSlug)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingPracticeSchema(error)) {
      return [];
    }

    throw error;
  }

  return ((data as PracticeTemplateRow[] | null) ?? [])
    .map(normalizeTemplateRow)
    .filter((template): template is PracticeQuestionTemplate => Boolean(template));
}

export async function savePracticeQuestionTemplate({
  template,
  actorId,
}: {
  template: Omit<PracticeQuestionTemplate, "id"> & { id?: string };
  actorId: string;
}) {
  const supabase = getPracticeAdminClient();

  if (!supabase) {
    throw new Error("Practice template backend is not configured.");
  }

  const payload = {
    topic_slug: template.topicSlug,
    depth: template.depth,
    kind: template.kind,
    prompt: template.prompt.trim(),
    guide: template.guide.trim() || null,
    answer_lines: template.answerLines,
    model_answer: template.modelAnswer?.trim() || null,
    rubric: template.rubric?.trim() || null,
    is_active: template.isActive,
    created_by_id: actorId,
    updated_at: new Date().toISOString(),
  };
  const query = template.id
    ? supabase
        .from("practice_question_templates")
        .upsert({ id: template.id, ...payload }, { onConflict: "id" })
    : supabase.from("practice_question_templates").insert(payload);
  const { data, error } = await query
    .select("id, topic_slug, depth, kind, prompt, guide, answer_lines, model_answer, rubric, is_active")
    .single();

  if (error) {
    if (isMissingPracticeSchema(error)) {
      throw new PracticeSchemaMissingError();
    }

    throw error;
  }

  const saved = normalizeTemplateRow(data as PracticeTemplateRow);

  if (!saved) {
    throw new Error("Practice template save returned an invalid row.");
  }

  return saved;
}

export async function savePracticeAttemptForUser({
  userId,
  topicSlug,
  seed,
  mode,
  sheet,
  answers,
}: {
  userId: string;
  topicSlug: string;
  seed: string;
  mode: PracticeMode;
  sheet: PracticeSheet;
  answers: Record<string, string>;
}) {
  const supabase = getPracticeAdminClient();

  if (!supabase) {
    throw new Error("Practice attempt backend is not configured.");
  }

  const topicId = await getTopicIdBySlug(topicSlug);
  const submittedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("practice_attempts")
    .insert({
      user_id: userId,
      topic_id: topicId,
      topic_slug: topicSlug,
      attempt_seed: seed,
      mode,
      question_count: sheet.sections.reduce((sum, section) => sum + section.questions.length, 0),
      generated_payload: sheet,
      answers_payload: answers,
      submitted_at: submittedAt,
    })
    .select("id, submitted_at")
    .single();

  if (error) {
    if (isMissingPracticeSchema(error)) {
      throw new PracticeSchemaMissingError();
    }

    throw error;
  }

  return {
    id: (data as { id?: string }).id ?? "",
    submittedAt: (data as { submitted_at?: string }).submitted_at ?? submittedAt,
  };
}
