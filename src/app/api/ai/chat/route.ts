import { NextResponse } from "next/server";

type IncomingMessage = {
  role?: unknown;
  content?: unknown;
};

type IncomingConfig = {
  apiUrl?: unknown;
  apiKey?: unknown;
  model?: unknown;
  systemPrompt?: unknown;
};

type ChatRequestBody = {
  messages?: unknown;
  config?: unknown;
};

function isMessageRole(value: unknown): value is "user" | "assistant" {
  return value === "user" || value === "assistant";
}

function normalizeMessages(messages: unknown) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.reduce<Array<{ role: "user" | "assistant"; content: string }>>(
    (collection, item) => {
      const candidate = item as IncomingMessage;

      if (!isMessageRole(candidate.role) || typeof candidate.content !== "string") {
        return collection;
      }

      const content = candidate.content.trim();

      if (!content) {
        return collection;
      }

      collection.push({
        role: candidate.role,
        content,
      });

      return collection;
    },
    [],
  );
}

function normalizeConfig(config: unknown) {
  const candidate = (config ?? {}) as IncomingConfig;

  return {
    apiUrl: typeof candidate.apiUrl === "string" ? candidate.apiUrl.trim() : "",
    apiKey: typeof candidate.apiKey === "string" ? candidate.apiKey.trim() : "",
    model: typeof candidate.model === "string" ? candidate.model.trim() : "",
    systemPrompt:
      typeof candidate.systemPrompt === "string" ? candidate.systemPrompt.trim() : "",
  };
}

function extractTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (!part || typeof part !== "object") {
        return "";
      }

      const candidate = part as { type?: unknown; text?: unknown };

      return candidate.type === "text" && typeof candidate.text === "string"
        ? candidate.text
        : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractUpstreamError(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const candidate = payload as {
    error?: { message?: unknown } | string;
    message?: unknown;
  };

  if (typeof candidate.error === "string") {
    return candidate.error;
  }

  if (candidate.error && typeof candidate.error === "object") {
    const errorMessage = (candidate.error as { message?: unknown }).message;

    if (typeof errorMessage === "string") {
      return errorMessage;
    }
  }

  return typeof candidate.message === "string" ? candidate.message : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
  const messages = normalizeMessages(body?.messages);
  const config = normalizeConfig(body?.config);

  if (!messages.length) {
    return NextResponse.json({ error: "전달된 대화 메시지가 없습니다." }, { status: 400 });
  }

  if (!config.apiUrl || !config.apiKey || !config.model) {
    return NextResponse.json(
      { error: "API URL, API Key, 모델 설정이 필요합니다." },
      { status: 400 },
    );
  }

  const upstreamMessages = [
    ...(config.systemPrompt
      ? [
          {
            role: "system",
            content: config.systemPrompt,
          },
        ]
      : []),
    ...messages,
  ];

  try {
    const upstreamResponse = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: upstreamMessages,
      }),
    });

    const payload = (await upstreamResponse.json().catch(() => null)) as
      | {
          choices?: Array<{
            message?: {
              content?: unknown;
            };
          }>;
          error?: unknown;
          message?: unknown;
        }
      | null;

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: extractUpstreamError(payload) || "외부 AI API 호출에 실패했습니다.",
        },
        { status: 502 },
      );
    }

    const content = extractTextContent(payload?.choices?.[0]?.message?.content);

    if (!content) {
      return NextResponse.json(
        { error: "외부 AI 응답에서 텍스트를 읽을 수 없습니다." },
        { status: 502 },
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "외부 AI API 연결 중 알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
