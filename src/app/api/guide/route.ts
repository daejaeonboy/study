import { NextResponse } from "next/server";

import { getGuideRecommendation } from "@/lib/repository";

export async function POST(request: Request) {
  const body = (await request.json()) as { query?: string };
  const recommendation = await getGuideRecommendation(body.query);

  return NextResponse.json(recommendation);
}
