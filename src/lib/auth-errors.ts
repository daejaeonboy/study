function extractCooldownSeconds(message: string) {
  const match = message.match(/after\s+(\d+)\s+seconds?/i);
  return match ? Number(match[1]) : null;
}

export function isAuthEmailRateLimitError(message: string) {
  return /email rate limit exceeded/i.test(message) || /request this after/i.test(message);
}

export function formatAuthErrorMessage(message: string) {
  const normalized = message.trim();
  const cooldownSeconds = extractCooldownSeconds(normalized);

  if (cooldownSeconds !== null) {
    return `보안을 위해 회원가입 요청이 잠시 제한되었습니다. 약 ${cooldownSeconds}초 후 다시 시도해 주세요.`;
  }

  if (isAuthEmailRateLimitError(normalized)) {
    return "보안을 위해 회원가입 요청이 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (/user already registered/i.test(normalized)) {
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  }

  if (/email address .* invalid/i.test(normalized)) {
    return "올바른 이메일 주소를 입력해 주세요.";
  }

  if (/password/i.test(normalized) && /least/i.test(normalized)) {
    return "비밀번호 조건을 다시 확인해 주세요.";
  }

  return normalized;
}
