#!/usr/bin/env node

import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

import {
  getBootstrapAdminDisplayName,
  getBootstrapAdminEmail,
  getBootstrapAdminId,
  normalizeBootstrapAdminEmail,
} from "../src/lib/editorial-bootstrap.ts";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function parseArgs(argv) {
  const options = {
    email: null,
    displayName: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--email") {
      options.email = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--display-name") {
      options.displayName = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function throwIfError(result, action) {
  if (result.error) {
    throw new Error(`${action}: ${result.error.message}`);
  }

  return result.data;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const email = normalizeBootstrapAdminEmail(options.email) ?? getBootstrapAdminEmail();

  if (!email) {
    throw new Error("Provide --email or set SUPABASE_BOOTSTRAP_ADMIN_EMAIL.");
  }

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const existingRows = await throwIfError(
    await supabase
      .from("editorial_users")
      .select("id, email")
      .or(`email.eq.${email},id.eq.${getBootstrapAdminId()}`),
    "Find bootstrap admin row",
  );
  const matchedByEmail = existingRows.find((row) => row.email?.toLowerCase() === email);
  const fallbackRow = existingRows.find((row) => row.id === getBootstrapAdminId());
  const rowId = matchedByEmail?.id ?? fallbackRow?.id ?? getBootstrapAdminId();
  const displayName = getBootstrapAdminDisplayName(email, options.displayName);

  const [saved] = await throwIfError(
    await supabase
      .from("editorial_users")
      .upsert(
        {
          id: rowId,
          display_name: displayName,
          email,
          role: "admin",
        },
        { onConflict: "id" },
      )
      .select("id, display_name, email, role"),
    "Upsert bootstrap admin row",
  );

  console.log(
    JSON.stringify(
      {
        id: saved.id,
        email: saved.email,
        displayName: saved.display_name,
        role: saved.role,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
