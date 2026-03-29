import type { EditorialRole } from "@/lib/domain";

export function canEditTopics(role: EditorialRole) {
  return role === "admin" || role === "editor" || role === "reviewer";
}

export function canManageAssignments(role: EditorialRole) {
  return role === "admin";
}

export function canManageReviews(role: EditorialRole) {
  return role === "admin" || role === "reviewer";
}
