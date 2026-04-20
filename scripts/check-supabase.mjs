#!/usr/bin/env node

import nextEnv from "@next/env";

import {
  TABLE_EXPECTATIONS,
  evaluateBootstrapAdmin,
  evaluateCount,
  evaluateEditorialUserReferences,
  getOverallStatus,
  summarizeCheckRows,
} from "./supabase-db-check-data.mjs";
import {
  getBootstrapAdminId,
  normalizeBootstrapAdminEmail,
} from "../src/lib/editorial-bootstrap.ts";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function requestJson(url, { headers = {}, method = "GET" } = {}) {
  const response = await fetch(url, {
    method,
    headers,
  });

  return {
    ok: response.ok,
    status: response.status,
    headers: response.headers,
    body: await response.text(),
  };
}

async function countTable({ url, serviceRoleKey, table }) {
  const result = await requestJson(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "count=exact",
    },
  });

  if (!result.ok) {
    return {
      name: table,
      ok: false,
      count: 0,
      expected: `>=${TABLE_EXPECTATIONS[table].minCount}`,
      detail: `HTTP ${result.status}`,
    };
  }

  const contentRange = result.headers.get("content-range") ?? "*/0";
  const count = Number.parseInt(contentRange.replace(/^.*\//, ""), 10);
  return evaluateCount(table, Number.isFinite(count) ? count : 0, TABLE_EXPECTATIONS[table]);
}

async function checkAuth({ url, anonKey }) {
  const result = await requestJson(`${url}/auth/v1/health`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  return {
    name: "auth_health",
    ok: result.ok,
    detail: `HTTP ${result.status}`,
  };
}

async function checkBootstrapAdmin({ url, serviceRoleKey, email }) {
  const normalizedEmail = normalizeBootstrapAdminEmail(email);

  if (!normalizedEmail) {
    return {
      name: "bootstrap_admin",
      ok: false,
      detail: "SUPABASE_BOOTSTRAP_ADMIN_EMAIL is not configured.",
    };
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };
  const byEmailResult = await requestJson(
    `${url}/rest/v1/editorial_users?select=id,email,role&email=eq.${encodeURIComponent(normalizedEmail)}`,
    { headers },
  );
  const byIdResult = await requestJson(
    `${url}/rest/v1/editorial_users?select=id,email,role&id=eq.${encodeURIComponent(getBootstrapAdminId())}`,
    { headers },
  );

  if (!byEmailResult.ok || !byIdResult.ok) {
    return {
      name: "bootstrap_admin",
      ok: false,
      detail: `HTTP email=${byEmailResult.status}, id=${byIdResult.status}`,
    };
  }

  return evaluateBootstrapAdmin({
    email: normalizedEmail,
    expectedId: getBootstrapAdminId(),
    rowsByEmail: JSON.parse(byEmailResult.body),
    rowsById: JSON.parse(byIdResult.body),
  });
}

async function readRestRows({ url, serviceRoleKey, table, select }) {
  const result = await requestJson(
    `${url}/rest/v1/${table}?select=${encodeURIComponent(select)}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  if (!result.ok) {
    throw new Error(`${table}: HTTP ${result.status}`);
  }

  return JSON.parse(result.body);
}

async function checkEditorialReferences({ url, serviceRoleKey }) {
  try {
    const [users, assignments, reviewTasks] = await Promise.all([
      readRestRows({ url, serviceRoleKey, table: "editorial_users", select: "id" }),
      readRestRows({
        url,
        serviceRoleKey,
        table: "topic_assignments",
        select: "topic_slug,assignee_id,assigned_by_id",
      }),
      readRestRows({
        url,
        serviceRoleKey,
        table: "topic_review_tasks",
        select: "id,requester_id,reviewer_id",
      }),
    ]);

    return evaluateEditorialUserReferences({
      userIds: new Set(users.map((user) => user.id)),
      assignments,
      reviewTasks,
    });
  } catch (error) {
    return {
      name: "editorial_user_references",
      ok: false,
      detail: error instanceof Error ? error.message : "failed to read editorial references",
    };
  }
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bootstrapAdminEmail = normalizeBootstrapAdminEmail(
    process.env.SUPABASE_BOOTSTRAP_ADMIN_EMAIL,
  );

  const tableRows = await Promise.all(
    Object.keys(TABLE_EXPECTATIONS).map((table) =>
      countTable({
        url,
        serviceRoleKey,
        table,
      }),
    ),
  );
  const rows = [
    await checkAuth({ url, anonKey }),
    ...tableRows,
    await checkEditorialReferences({ url, serviceRoleKey }),
    await checkBootstrapAdmin({ url, serviceRoleKey, email: bootstrapAdminEmail }),
  ];
  const summary = summarizeCheckRows(rows);

  console.log(
    JSON.stringify(
      {
        status: getOverallStatus(rows),
        summary,
        checks: rows,
      },
      null,
      2,
    ),
  );

  if (!summary.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
