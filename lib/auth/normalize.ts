export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parseAdminEmails(value?: string) {
  return new Set((value ?? "").split(",").map((email) => normalizeEmail(email)).filter(Boolean));
}
