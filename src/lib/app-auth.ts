import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import type { AppUser } from "@/lib/domain";
import { createAuthServerClient, hasSupabaseAuthConfig } from "@/lib/supabase/auth-server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

type SupabaseAppUserRow = {
  id?: string | null;
  email?: string | null;
  display_name?: string | null;
};

function normalizeDisplayName(displayName: string | null | undefined, email?: string | null) {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  if (email?.includes("@")) {
    return email.split("@")[0] ?? email;
  }

  return "학습자";
}

function buildAuthUrl(nextPath: string, message?: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("next", nextPath);

  if (message) {
    searchParams.set("message", message);
  }

  return `/auth?${searchParams.toString()}`;
}

function mapFallbackUser(authUser: User, displayName?: string): AppUser | null {
  if (!authUser.email) {
    return null;
  }

  return {
    id: authUser.id,
    email: authUser.email,
    displayName: normalizeDisplayName(
      displayName ?? (authUser.user_metadata?.display_name as string | undefined),
      authUser.email,
    ),
  };
}

function mapAppUserRow(row: SupabaseAppUserRow | null | undefined): AppUser | null {
  if (
    !row ||
    typeof row.id !== "string" ||
    typeof row.email !== "string" ||
    typeof row.display_name !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
  };
}

async function getStoredAppUserForAuthUser(authUser: User) {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email, display_name")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return mapAppUserRow(data as SupabaseAppUserRow | null);
}

export async function getAuthenticatedAppAuthUser() {
  if (!hasSupabaseAuthConfig()) {
    return null;
  }

  const supabase = await createAuthServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getSessionAppUser(): Promise<AppUser | null> {
  const authUser = await getAuthenticatedAppAuthUser();

  if (!authUser) {
    return null;
  }

  return (await getStoredAppUserForAuthUser(authUser)) ?? mapFallbackUser(authUser);
}

export async function ensureAppUserForAuthUser(
  authUser: User,
  displayName?: string,
): Promise<AppUser | null> {
  const resolvedDisplayName =
    displayName ?? (authUser.user_metadata?.display_name as string | undefined);
  const fallbackUser = mapFallbackUser(authUser, resolvedDisplayName);

  if (!hasSupabaseAdminConfig() || !authUser.email) {
    return fallbackUser;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return fallbackUser;
  }

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        id: authUser.id,
        email: authUser.email,
        display_name: normalizeDisplayName(resolvedDisplayName, authUser.email),
      },
      {
        onConflict: "id",
      },
    )
    .select("id, email, display_name")
    .single();

  if (error) {
    throw error;
  }

  return mapAppUserRow(data as SupabaseAppUserRow | null) ?? fallbackUser;
}

export async function requireAppUser(nextPath: string): Promise<AppUser> {
  const authUser = await getAuthenticatedAppAuthUser();

  if (!authUser) {
    redirect(buildAuthUrl(nextPath));
  }

  const appUser = await ensureAppUserForAuthUser(authUser);

  if (!appUser) {
    redirect(buildAuthUrl(nextPath, "로그인은 되었지만 사용자 프로필을 확인할 수 없습니다."));
  }

  return appUser;
}
