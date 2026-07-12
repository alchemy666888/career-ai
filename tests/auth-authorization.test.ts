import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { normalizeEmail, parseAdminEmails } from "@/lib/auth/normalize";

describe("auth and authorization configuration", () => {
  it("normalizes email addresses and admin allowlist entries", () => {
    expect(normalizeEmail(" Admin@Example.COM ")).toBe("admin@example.com");
    expect(parseAdminEmails("Admin@Example.com, other@example.com").has("admin@example.com")).toBe(true);
  });

  it("uses database sessions and a local Drizzle adapter", () => {
    const source = readFileSync("lib/auth/auth.ts", "utf8");
    expect(source).toContain('"database"');
    expect(source).toContain("CareerDrizzleAdapter");
    expect(source).toContain("GitHub");
    expect(source).toContain("Google");
    expect(source).toContain("EMAIL_AUTH_ENABLED");
  });

  it("defines central authorization helpers", () => {
    const source = readFileSync("lib/auth/authorization.ts", "utf8");
    expect(source).toContain("requireUser");
    expect(source).toContain("requireActiveUser");
    expect(source).toContain("requireAdmin");
    expect(source).toContain("assertOwner");
  });
});
