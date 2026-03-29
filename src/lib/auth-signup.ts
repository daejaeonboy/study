import type { Session, User } from "@supabase/supabase-js";

import { isAuthEmailRateLimitError } from "@/lib/auth-errors";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

type SignupResult = {
  session: Session | null;
  user: User;
};

type SignupInput = {
  email: string;
  password: string;
  displayName?: string;
  emailRedirectTo: string;
};

function buildUserMetadata(displayName?: string) {
  return displayName ? { display_name: displayName } : {};
}

async function findExistingAuthUserByEmail(email: string) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return null;
  }

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) {
    throw error;
  }

  return (
    data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null
  );
}

async function createOrConfirmUserWithAdmin({
  email,
  password,
  displayName,
}: Omit<SignupInput, "emailRedirectTo">) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase admin configuration is missing.");
  }

  const existingUser = await findExistingAuthUserByEmail(email);

  if (existingUser) {
    const { data, error } = await admin.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existingUser.user_metadata ?? {}),
        ...buildUserMetadata(displayName),
      },
    });

    if (error || !data.user) {
      throw error ?? new Error("Failed to confirm existing auth user.");
    }

    return data.user;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: buildUserMetadata(displayName),
  });

  if (error || !data.user) {
    throw error ?? new Error("Failed to create auth user.");
  }

  return data.user;
}

export async function signupWithFallback({
  email,
  password,
  displayName,
  emailRedirectTo,
}: SignupInput): Promise<SignupResult> {
  const supabase = await createAuthServerClient();

  if (!supabase) {
    throw new Error("Supabase Auth is not configured.");
  }

  const signupResult = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: buildUserMetadata(displayName),
      emailRedirectTo,
    },
  });

  if (!signupResult.error && signupResult.data.user) {
    return {
      user: signupResult.data.user,
      session: signupResult.data.session,
    };
  }

  if (!signupResult.error) {
    throw new Error("회원가입 응답에 사용자 정보가 없습니다.");
  }

  if (!isAuthEmailRateLimitError(signupResult.error.message) || !hasSupabaseAdminConfig()) {
    throw signupResult.error;
  }

  await createOrConfirmUserWithAdmin({
    email,
    password,
    displayName,
  });

  const signInResult = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInResult.error || !signInResult.data.user) {
    throw signInResult.error ?? new Error("회원가입 후 자동 로그인에 실패했습니다.");
  }

  return {
    user: signInResult.data.user,
    session: signInResult.data.session,
  };
}
