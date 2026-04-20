import assert from "node:assert/strict";
import test from "node:test";

import {
  TABLE_EXPECTATIONS,
  evaluateBootstrapAdmin,
  evaluateCount,
  evaluateEditorialUserReferences,
  getOverallStatus,
  summarizeCheckRows,
} from "./supabase-db-check-data.mjs";

test("defines minimum expectations for operational seed tables", () => {
  assert.equal(TABLE_EXPECTATIONS.topics.minCount, 20);
  assert.equal(TABLE_EXPECTATIONS.topic_layers.minCount, 60);
  assert.equal(TABLE_EXPECTATIONS.editorial_users.minCount, 1);
  assert.equal(TABLE_EXPECTATIONS.practice_question_templates.minCount, 0);
  assert.equal(TABLE_EXPECTATIONS.practice_attempts.minCount, 0);
});

test("evaluates count checks against minimum expectations", () => {
  assert.deepEqual(evaluateCount("topics", 20, TABLE_EXPECTATIONS.topics), {
    name: "topics",
    ok: true,
    count: 20,
    expected: ">=20",
  });
  assert.deepEqual(evaluateCount("topics", 3, TABLE_EXPECTATIONS.topics), {
    name: "topics",
    ok: false,
    count: 3,
    expected: ">=20",
  });
});

test("summarizes check rows and overall status", () => {
  const rows = [
    { name: "auth", ok: true },
    { name: "topics", ok: true, count: 20, expected: ">=20" },
    { name: "admin", ok: false, detail: "missing" },
  ];

  assert.deepEqual(summarizeCheckRows(rows), {
    ok: false,
    total: 3,
    passed: 2,
    failed: 1,
  });
  assert.equal(getOverallStatus(rows), "needs_attention");
  assert.equal(getOverallStatus(rows.slice(0, 2)), "ready");
});

test("evaluates bootstrap admin identity and role", () => {
  assert.deepEqual(
    evaluateBootstrapAdmin({
      email: "cryingonion77@gmail.com",
      expectedId: "bootstrap-admin",
      rowsByEmail: [
        {
          id: "bootstrap-admin",
          email: "cryingonion77@gmail.com",
          role: "admin",
        },
      ],
      rowsById: [
        {
          id: "bootstrap-admin",
          email: "cryingonion77@gmail.com",
          role: "admin",
        },
      ],
    }),
    {
      name: "bootstrap_admin",
      ok: true,
      detail: "cryingonion77@gmail.com / admin / bootstrap-admin",
    },
  );

  assert.equal(
    evaluateBootstrapAdmin({
      email: "cryingonion77@gmail.com",
      expectedId: "bootstrap-admin",
      rowsByEmail: [
        {
          id: "other-admin",
          email: "cryingonion77@gmail.com",
          role: "admin",
        },
      ],
      rowsById: [],
    }).ok,
    false,
  );
});

test("evaluates editorial assignment and review user references", () => {
  const okResult = evaluateEditorialUserReferences({
    userIds: new Set(["bootstrap-admin", "ops-editor", "ops-reviewer"]),
    assignments: [
      {
        topic_slug: "black-hole",
        assignee_id: "ops-editor",
        assigned_by_id: "bootstrap-admin",
      },
    ],
    reviewTasks: [
      {
        id: "review-black-hole-1",
        requester_id: "ops-editor",
        reviewer_id: "ops-reviewer",
      },
    ],
  });

  assert.deepEqual(okResult, {
    name: "editorial_user_references",
    ok: true,
    detail: "all assignment/review user references resolved",
  });

  const missingResult = evaluateEditorialUserReferences({
    userIds: new Set(["bootstrap-admin"]),
    assignments: [
      {
        topic_slug: "black-hole",
        assignee_id: "missing-editor",
        assigned_by_id: "bootstrap-admin",
      },
    ],
    reviewTasks: [],
  });

  assert.equal(missingResult.ok, false);
  assert.match(missingResult.detail, /missing-editor/);
});
