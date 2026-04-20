import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import type { EditorialRole, EditorialUser } from "@/lib/domain";
import { getInitialEditorialRole } from "@/lib/editorial-bootstrap";
import { canEditTopics, canManageAssignments, canManageReviews } from "@/lib/editorial-permissions";
import { getEditorialUserById, getEditorialUsers } from "@/lib/editorial-repository";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";
import { createAuthServerClient, hasSupabaseAuthConfig } from "@/lib/supabase/auth-server";
export { canEditTopics, canManageAssignments, canManageReviews };

function normalizeDisplayName(displayName: string | null | undefined, email?: string | null) {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  if (email?.includes("@")) {
    return email.split("@")[0] ?? email;
  }

  return "운영자";
}

function buildLoginUrl(nextPath: string, message?: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("next", nextPath);

  if (message) {
    searchParams.set("message", message);
  }

  return `/login?${searchParams.toString()}`;
}

export async function getAuthenticatedAuthUser() {
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

export async function getEditorialUserForAuthUser(authUser: User): Promise<EditorialUser | null> {
  const matchedById = await getEditorialUserById(authUser.id);

  if (matchedById) {
    return matchedById;
  }

  if (!authUser.email) {
    return null;
  }

  const users = await getEditorialUsers();

  return (
    users.find((user) => user.email.toLowerCase() === authUser.email?.toLowerCase()) ?? null
  );
}

export async function ensureEditorialUserForAuthUser(
  authUser: User,
  displayName?: string,
): Promise<EditorialUser | null> {
  const existingUser = await getEditorialUserForAuthUser(authUser);

  if (existingUser) {
    return existingUser;
  }

  if (!hasSupabaseAdminConfig() || !authUser.email) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { count, error: countError } = await supabase
    .from("editorial_users")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  const role: EditorialRole = getInitialEditorialRole({
    existingUserCount: count ?? 0,
    email: authUser.email,
  });
  const { data, error } = await supabase
    .from("editorial_users")
    .upsert(
      {
        id: authUser.id,
        display_name: normalizeDisplayName(
          displayName ?? (authUser.user_metadata?.display_name as string | undefined),
          authUser.email,
        ),
        email: authUser.email,
        role,
      },
      {
        onConflict: "id",
      },
    )
    .select("id, display_name, email, role")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    role: data.role,
  };
}

export async function getSessionEditorialUser(): Promise<EditorialUser | null> {
  const authUser = await getAuthenticatedAuthUser();

  if (!authUser) {
    return null;
  }

  return getEditorialUserForAuthUser(authUser);
}

export async function requireEditorialUser(
  nextPath: string,
  allowedRoles?: EditorialRole[],
): Promise<EditorialUser> {
  const authUser = await getAuthenticatedAuthUser();

  if (!authUser) {
    redirect(buildLoginUrl(nextPath));
  }

  const editorialUser = await getEditorialUserForAuthUser(authUser);

  if (!editorialUser) {
    redirect(
      buildLoginUrl(
        nextPath,
        "로그인은 되었지만 운영진 권한이 아직 없습니다. 회원가입 후 다시 로그인하거나 DB 역할을 확인하세요.",
      ),
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(editorialUser.role)) {
    redirect(buildLoginUrl(nextPath, "이 화면에 접근할 권한이 없습니다."));
  }

  return editorialUser;
}

export async function getApiEditorialUser(allowedRoles?: EditorialRole[]) {
  const authUser = await getAuthenticatedAuthUser();

  if (!authUser) {
    return {
      ok: false as const,
      response: Response.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  const editorialUser = await getEditorialUserForAuthUser(authUser);

  if (!editorialUser) {
    return {
      ok: false as const,
      response: Response.json({ error: "Editorial role is required." }, { status: 403 }),
    };
  }

  if (allowedRoles?.length && !allowedRoles.includes(editorialUser.role)) {
    return {
      ok: false as const,
      response: Response.json({ error: "You do not have permission." }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    editorialUser,
    authUser,
  };
}
