export const TABLE_EXPECTATIONS = {
  topics: { minCount: 20 },
  topic_layers: { minCount: 60 },
  topic_sources: { minCount: 1 },
  topic_relations: { minCount: 1 },
  topic_bundle_revisions: { minCount: 20 },
  editorial_users: { minCount: 1 },
  topic_assignments: { minCount: 1 },
  topic_review_tasks: { minCount: 1 },
  users: { minCount: 0 },
  user_progress: { minCount: 0 },
  user_bookmarks: { minCount: 0 },
  user_notes: { minCount: 0 },
  practice_question_templates: { minCount: 0 },
  practice_attempts: { minCount: 0 },
};

export function evaluateCount(name, count, expectation) {
  const expected = `>=${expectation.minCount}`;

  return {
    name,
    ok: count >= expectation.minCount,
    count,
    expected,
  };
}

export function summarizeCheckRows(rows) {
  const passed = rows.filter((row) => row.ok).length;
  const failed = rows.length - passed;

  return {
    ok: failed === 0,
    total: rows.length,
    passed,
    failed,
  };
}

export function getOverallStatus(rows) {
  return summarizeCheckRows(rows).ok ? "ready" : "needs_attention";
}

export function evaluateBootstrapAdmin({ email, expectedId, rowsByEmail, rowsById }) {
  if (!email) {
    return {
      name: "bootstrap_admin",
      ok: false,
      detail: "SUPABASE_BOOTSTRAP_ADMIN_EMAIL is not configured.",
    };
  }

  if (rowsByEmail.length !== 1) {
    return {
      name: "bootstrap_admin",
      ok: false,
      detail: `expected exactly 1 row for ${email}, found ${rowsByEmail.length}`,
    };
  }

  const [admin] = rowsByEmail;
  const idRowsMatch = rowsById.length === 1 && rowsById[0]?.email?.toLowerCase() === email;
  const ok = admin.id === expectedId && admin.role === "admin" && idRowsMatch;

  return {
    name: "bootstrap_admin",
    ok,
    detail: ok
      ? `${admin.email} / ${admin.role} / ${admin.id}`
      : `email row ${admin.id}/${admin.role}; ${expectedId} rows: ${rowsById.length}`,
  };
}

export function evaluateEditorialUserReferences({ userIds, assignments, reviewTasks }) {
  const missing = [];

  assignments.forEach((assignment) => {
    if (!userIds.has(assignment.assignee_id)) {
      missing.push(`assignment ${assignment.topic_slug} assignee ${assignment.assignee_id}`);
    }

    if (!userIds.has(assignment.assigned_by_id)) {
      missing.push(`assignment ${assignment.topic_slug} assigned_by ${assignment.assigned_by_id}`);
    }
  });

  reviewTasks.forEach((task) => {
    if (!userIds.has(task.requester_id)) {
      missing.push(`review ${task.id} requester ${task.requester_id}`);
    }

    if (task.reviewer_id && !userIds.has(task.reviewer_id)) {
      missing.push(`review ${task.id} reviewer ${task.reviewer_id}`);
    }
  });

  return {
    name: "editorial_user_references",
    ok: missing.length === 0,
    detail: missing.length ? missing.slice(0, 5).join("; ") : "all assignment/review user references resolved",
  };
}
