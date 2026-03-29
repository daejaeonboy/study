"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureAppUserForAuthUser } from "@/lib/app-auth";
import { formatAuthErrorMessage } from "@/lib/auth-errors";
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
  return headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function login(formData: FormData) {
  const supabase = await createAuthServerClient();

  if (!supabase) {
    redirect(buildMessageUrl("/auth", "Supabase Auth 환경 변수가 아직 설정되지 않았습니다."));
  }

  const nextPath =
    typeof formData.get("next") === "string" && (formData.get("next") as string)
      ? (formData.get("next") as string)
      : "/library";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(buildMessageUrl("/auth", "로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.", nextPath));
  }

  try {
    await ensureAppUserForAuthUser(data.user);
  } catch (error) {
    redirect(
      buildMessageUrl(
        "/auth",
        error instanceof Error
          ? `사용자 프로필 생성에 실패했습니다: ${error.message}`
          : "사용자 프로필 생성에 실패했습니다.",
        nextPath,
      ),
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/library");
  redirect(nextPath);
}

export async function signup(formData: FormData) {
  const supabase = await createAuthServerClient();
  const authPath =
    typeof formData.get("auth_path") === "string" && (formData.get("auth_path") as string)
      ? (formData.get("auth_path") as string)
      : "/auth";

  if (!supabase) {
    redirect(buildMessageUrl(authPath, "Supabase Auth 환경 변수가 아직 설정되지 않았습니다."));
  }

  const nextPath =
    typeof formData.get("next") === "string" && (formData.get("next") as string)
      ? (formData.get("next") as string)
      : "/library";
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
        "회원가입이 완료되었습니다. 이메일 인증이 켜져 있으면 메일 확인 후 다시 로그인해 주세요.",
        nextPath,
      ),
    );
  }

  try {
    await ensureAppUserForAuthUser(data.user, displayName);
  } catch (error) {
    redirect(
      buildMessageUrl(
        authPath,
        error instanceof Error
          ? `사용자 프로필 생성에 실패했습니다: ${error.message}`
          : "사용자 프로필 생성에 실패했습니다.",
        nextPath,
      ),
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/library");
  redirect(nextPath);
}

export async function logout() {
  const supabase = await createAuthServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  revalidatePath("/library");
  redirect("/auth?message=로그아웃했습니다.");
}
