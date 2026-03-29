"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { formatAuthErrorMessage } from "@/lib/auth-errors";
import { ensureEditorialUserForAuthUser } from "@/lib/editorial-auth";
import { signupWithFallback } from "@/lib/auth-signup";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

function buildMessageUrl(pathname: string, message: string, next?: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("message", message);

  if (next) {
    searchParams.set("next", next);
  }

  return `${pathname}?${searchParams.toString()}`;
}

async function getOrigin() {
  const headerStore = await headers();
  return (
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export async function login(formData: FormData) {
  const supabase = await createAuthServerClient();

  if (!supabase) {
    redirect(
      buildMessageUrl("/login", "Supabase Auth 환경 변수가 아직 설정되지 않았습니다."),
    );
  }

  const nextPath =
    typeof formData.get("next") === "string" && (formData.get("next") as string)
      ? (formData.get("next") as string)
      : "/admin";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(buildMessageUrl("/login", "로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.", nextPath));
  }

  let editorialUser = null;

  try {
    editorialUser = await ensureEditorialUserForAuthUser(data.user);
  } catch (error) {
    redirect(
      buildMessageUrl(
        "/login",
        error instanceof Error
          ? `운영진 프로필 생성에 실패했습니다: ${error.message}`
          : "운영진 프로필 생성에 실패했습니다.",
        nextPath,
      ),
    );
  }

  if (!editorialUser) {
    redirect(
      buildMessageUrl(
        "/login",
        "로그인은 되었지만 운영진 프로필을 만들 수 없었습니다. schema.sql 적용 여부를 확인하세요.",
        nextPath,
      ),
    );
  }

  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function signup(formData: FormData) {
  const supabase = await createAuthServerClient();
  const authPath =
    typeof formData.get("auth_path") === "string" && (formData.get("auth_path") as string)
      ? (formData.get("auth_path") as string)
      : "/login";

  if (!supabase) {
    redirect(
      buildMessageUrl(authPath, "Supabase Auth 환경 변수가 아직 설정되지 않았습니다."),
    );
  }

  const nextPath =
    typeof formData.get("next") === "string" && (formData.get("next") as string)
      ? (formData.get("next") as string)
      : "/admin";
  const email = String(formData.get("signup_email") ?? "").trim();
  const password = String(formData.get("signup_password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const origin = await getOrigin();
  let data;

  try {
    data = await signupWithFallback({
      email,
      password,
      displayName,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "회원가입에 실패했습니다.";

    redirect(
      buildMessageUrl(
        authPath,
        `회원가입에 실패했습니다: ${formatAuthErrorMessage(message)}`,
        nextPath,
      ),
    );
  }

  if (!data.user) {
    redirect(buildMessageUrl(authPath, "회원가입 응답에 사용자 정보가 없습니다.", nextPath));
  }

  if (!data.session) {
    redirect(
      buildMessageUrl(
        authPath,
        "회원가입 완료. 이메일 확인이 켜져 있으면 메일 인증 후 다시 로그인하세요.",
        nextPath,
      ),
    );
  }

  let editorialUser = null;

  try {
    editorialUser = await ensureEditorialUserForAuthUser(data.user, displayName);
  } catch (error) {
    redirect(
      buildMessageUrl(
        authPath,
        error instanceof Error
          ? `운영진 프로필 생성에 실패했습니다: ${error.message}`
          : "운영진 프로필 생성에 실패했습니다.",
        nextPath,
      ),
    );
  }

  if (!editorialUser) {
    redirect(
      buildMessageUrl(
        authPath,
        "회원가입은 되었지만 운영진 프로필을 만들 수 없었습니다. schema.sql 적용 여부를 확인하세요.",
        nextPath,
      ),
    );
  }

  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function logout() {
  const supabase = await createAuthServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login?message=로그아웃했습니다.");
}
