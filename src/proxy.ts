import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/",
    "/guide",
    "/library",
    "/signup",
    "/path/:path*",
    "/topic/:path*",
    "/workspace",
    "/admin",
    "/admin/:path*",
    "/auth",
    "/login",
    "/login/:path*",
    "/api/library",
    "/auth/:path*",
    "/api/admin/:path*",
  ],
};
