import type {
  AdminTopicRecord,
  AdminTopicSummaryRecord,
  EditorialRole,
  EditorialUser,
  ReviewTaskStatus,
  TopicAssignment,
  TopicReviewTask,
} from "@/lib/domain";
import { currentEditorialUserId, editorialUsers, topicAssignments, topicReviewTasks } from "@/lib/editorial-seed";
import { getTopicBySlug, getTopicSummaryBySlug, getTopicSummaries, getTopics } from "@/lib/repository";
import { createSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

type SupabaseEditorialUserRow = {
  id?: string | null;
  display_name?: string | null;
  email?: string | null;
  role?: EditorialRole | null;
};

type SupabaseAssignmentRow = {
  topic_slug?: string | null;
  assignee_id?: string | null;
  assigned_by_id?: string | null;
  assigned_at?: string | null;
  note?: string | null;
};

type SupabaseReviewTaskRow = {
  id?: string | null;
  topic_slug?: string | null;
  status?: ReviewTaskStatus | null;
  requester_id?: string | null;
  reviewer_id?: string | null;
  requested_at?: string | null;
  reviewed_at?: string | null;
  comment?: string | null;
};

function normalizeUsers(rows: SupabaseEditorialUserRow[]): EditorialUser[] {
  return rows.reduce<EditorialUser[]>((collection, row) => {
    if (
      typeof row.id !== "string" ||
      typeof row.display_name !== "string" ||
      typeof row.email !== "string" ||
      typeof row.role !== "string"
    ) {
      return collection;
    }

    collection.push({
      id: row.id,
      displayName: row.display_name,
      email: row.email,
      role: row.role,
    });

    return collection;
  }, []);
}

function normalizeAssignments(rows: SupabaseAssignmentRow[]): TopicAssignment[] {
  return rows.reduce<TopicAssignment[]>((collection, row) => {
    if (
      typeof row.topic_slug !== "string" ||
      typeof row.assignee_id !== "string" ||
      typeof row.assigned_by_id !== "string" ||
      typeof row.assigned_at !== "string"
    ) {
      return collection;
    }

    collection.push({
      topicSlug: row.topic_slug,
      assigneeId: row.assignee_id,
      assignedById: row.assigned_by_id,
      assignedAt: row.assigned_at,
      note: row.note ?? undefined,
    });

    return collection;
  }, []);
}

function normalizeReviewTasks(rows: SupabaseReviewTaskRow[]): TopicReviewTask[] {
  return rows.reduce<TopicReviewTask[]>((collection, row) => {
    if (
      typeof row.id !== "string" ||
      typeof row.topic_slug !== "string" ||
      typeof row.status !== "string" ||
      typeof row.requester_id !== "string" ||
      typeof row.requested_at !== "string"
    ) {
      return collection;
    }

    collection.push({
      id: row.id,
      topicSlug: row.topic_slug,
      status: row.status,
      requesterId: row.requester_id,
      reviewerId: row.reviewer_id ?? undefined,
      requestedAt: row.requested_at,
      reviewedAt: row.reviewed_at ?? undefined,
      comment: row.comment ?? undefined,
    });

    return collection;
  }, []);
}

function buildUserMap(users: EditorialUser[]) {
  return new Map(users.map((user) => [user.id, user]));
}

function buildAssignmentMap(assignments: TopicAssignment[]) {
  return new Map(assignments.map((assignment) => [assignment.topicSlug, assignment]));
}

function buildLatestReviewTaskMap(reviewTasks: TopicReviewTask[]) {
  const latestReviewTaskMap = new Map<string, TopicReviewTask>();

  reviewTasks.forEach((task) => {
    const current = latestReviewTaskMap.get(task.topicSlug);

    if (!current || current.requestedAt < task.requestedAt) {
      latestReviewTaskMap.set(task.topicSlug, task);
    }
  });

  return latestReviewTaskMap;
}

async function getAssignmentByTopicSlug(topicSlug: string): Promise<TopicAssignment | null> {
  const supabase = getSupabaseReadClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("topic_assignments")
      .select("topic_slug, assignee_id, assigned_by_id, assigned_at, note")
      .eq("topic_slug", topicSlug)
      .maybeSingle();

    if (!error && data) {
      const assignment = normalizeAssignments([data as SupabaseAssignmentRow])[0];
      return assignment ?? null;
    }
  }

  return (await getTopicAssignments()).find((assignment) => assignment.topicSlug === topicSlug) ?? null;
}

async function getLatestReviewTaskByTopicSlug(topicSlug: string): Promise<TopicReviewTask | null> {
  const supabase = getSupabaseReadClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("topic_review_tasks")
      .select("id, topic_slug, status, requester_id, reviewer_id, requested_at, reviewed_at, comment")
      .eq("topic_slug", topicSlug)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const task = normalizeReviewTasks([data as SupabaseReviewTaskRow])[0];
      return task ?? null;
    }
  }

  const reviewTasks = await getTopicReviewTasks();
  return reviewTasks.find((task) => task.topicSlug === topicSlug) ?? null;
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

export async function getEditorialUsers(): Promise<EditorialUser[]> {
  const supabase = getSupabaseReadClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("editorial_users")
      .select("id, display_name, email, role")
      .order("display_name", { ascending: true });

    if (!error && data?.length) {
      return normalizeUsers(data as SupabaseEditorialUserRow[]);
    }
  }

  return editorialUsers;
}

export async function getEditorialUserById(id: string): Promise<EditorialUser | null> {
  const users = await getEditorialUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function getCurrentEditorialUser(preferredId?: string): Promise<EditorialUser> {
  const users = await getEditorialUsers();
  const resolvedPreferredId =
    preferredId ?? process.env.NEXT_PUBLIC_EDITORIAL_USER_ID ?? currentEditorialUserId;

  return users.find((user) => user.id === resolvedPreferredId) ?? users[0];
}

export async function getTopicAssignments(): Promise<TopicAssignment[]> {
  const supabase = getSupabaseReadClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("topic_assignments")
      .select("topic_slug, assignee_id, assigned_by_id, assigned_at, note")
      .order("assigned_at", { ascending: false });

    if (!error && data?.length) {
      return normalizeAssignments(data as SupabaseAssignmentRow[]);
    }
  }

  return topicAssignments;
}

export async function getTopicReviewTasks(): Promise<TopicReviewTask[]> {
  const supabase = getSupabaseReadClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("topic_review_tasks")
      .select("id, topic_slug, status, requester_id, reviewer_id, requested_at, reviewed_at, comment")
      .order("requested_at", { ascending: false });

    if (!error && data?.length) {
      return normalizeReviewTasks(data as SupabaseReviewTaskRow[]);
    }
  }

  return topicReviewTasks;
}

function buildAdminTopicRecord<TTopic extends { slug: string }>(
  topic: TTopic,
  userMap: Map<string, EditorialUser>,
  assignmentMap: Map<string, TopicAssignment>,
  latestReviewTaskMap: Map<string, TopicReviewTask>,
) {
  const assignment = assignmentMap.get(topic.slug);
  const latestReviewTask = latestReviewTaskMap.get(topic.slug);

  return {
    topic,
    assignment,
    assignee: assignment ? userMap.get(assignment.assigneeId) : undefined,
    assignedBy: assignment ? userMap.get(assignment.assignedById) : undefined,
    latestReviewTask,
  };
}

export async function getAdminTopicSummaryRecords(): Promise<AdminTopicSummaryRecord[]> {
  const [topics, users, assignments, reviewTasks] = await Promise.all([
    getTopicSummaries(),
    getEditorialUsers(),
    getTopicAssignments(),
    getTopicReviewTasks(),
  ]);

  const userMap = buildUserMap(users);
  const assignmentMap = buildAssignmentMap(assignments);
  const latestReviewTaskMap = buildLatestReviewTaskMap(reviewTasks);

  return topics.map((topic) => buildAdminTopicRecord(topic, userMap, assignmentMap, latestReviewTaskMap));
}

export async function getAdminTopicSummaryRecordBySlug(slug: string): Promise<AdminTopicSummaryRecord | null> {
  const [topic, users, assignment, latestReviewTask] = await Promise.all([
    getTopicSummaryBySlug(slug),
    getEditorialUsers(),
    getAssignmentByTopicSlug(slug),
    getLatestReviewTaskByTopicSlug(slug),
  ]);

  if (!topic) {
    return null;
  }

  const userMap = buildUserMap(users);

  return {
    topic,
    assignment: assignment ?? undefined,
    assignee: assignment ? userMap.get(assignment.assigneeId) : undefined,
    assignedBy: assignment ? userMap.get(assignment.assignedById) : undefined,
    latestReviewTask: latestReviewTask ?? undefined,
  };
}

export async function getAdminTopicRecords(): Promise<AdminTopicRecord[]> {
  const [topics, users, assignments, reviewTasks] = await Promise.all([
    getTopics(),
    getEditorialUsers(),
    getTopicAssignments(),
    getTopicReviewTasks(),
  ]);

  const userMap = buildUserMap(users);
  const assignmentMap = buildAssignmentMap(assignments);
  const latestReviewTaskMap = buildLatestReviewTaskMap(reviewTasks);

  return topics.map((topic) => buildAdminTopicRecord(topic, userMap, assignmentMap, latestReviewTaskMap));
}

export async function getAdminTopicRecordBySlug(slug: string): Promise<AdminTopicRecord | null> {
  const [topic, users, assignment, latestReviewTask] = await Promise.all([
    getTopicBySlug(slug),
    getEditorialUsers(),
    getAssignmentByTopicSlug(slug),
    getLatestReviewTaskByTopicSlug(slug),
  ]);

  if (!topic) {
    return null;
  }

  const userMap = buildUserMap(users);

  return {
    topic,
    assignment: assignment ?? undefined,
    assignee: assignment ? userMap.get(assignment.assigneeId) : undefined,
    assignedBy: assignment ? userMap.get(assignment.assignedById) : undefined,
    latestReviewTask: latestReviewTask ?? undefined,
  };
}

export async function getReviewQueue(): Promise<TopicReviewTask[]> {
  const tasks = await getTopicReviewTasks();
  return tasks.filter((task) => task.status !== "approved");
}
