import { NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createAuthServerClient();
    await supabase?.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
