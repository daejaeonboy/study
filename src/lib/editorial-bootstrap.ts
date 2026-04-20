import type { EditorialRole } from "@/lib/domain";

const BOOTSTRAP_ADMIN_ID = "bootstrap-admin";

export function normalizeBootstrapAdminEmail(email?: string | null) {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
}

export function getBootstrapAdminEmail() {
  return normalizeBootstrapAdminEmail(process.env.SUPABASE_BOOTSTRAP_ADMIN_EMAIL);
}

export function isBootstrapAdminEmail(
  email: string | null | undefined,
  configuredEmail = getBootstrapAdminEmail(),
) {
  const normalizedEmail = normalizeBootstrapAdminEmail(email);
  return Boolean(normalizedEmail && configuredEmail && normalizedEmail === configuredEmail);
}

export function getInitialEditorialRole({
  existingUserCount,
  email,
  bootstrapAdminEmail = getBootstrapAdminEmail(),
}: {
  existingUserCount: number;
  email?: string | null;
  bootstrapAdminEmail?: string | null;
}): EditorialRole {
  if (isBootstrapAdminEmail(email, bootstrapAdminEmail)) {
    return "admin";
  }

  return existingUserCount === 0 ? "admin" : "editor";
}

export function getBootstrapAdminId() {
  return BOOTSTRAP_ADMIN_ID;
}

export function getBootstrapAdminDisplayName(email: string, displayName?: string | null) {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  return email.includes("@") ? (email.split("@")[0] ?? email) : email;
}
