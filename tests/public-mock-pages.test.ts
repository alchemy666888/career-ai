import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public mock jobs and profile pages", () => {
  it("does not protect /jobs or /profile in middleware", () => {
    const middleware = readFileSync("middleware.ts", "utf8");
    expect(middleware).not.toContain('"/jobs/:path*"');
    expect(middleware).not.toContain('"/profile/:path*"');
  });

  it("renders jobs and profile from mock data without requireActiveUser", () => {
    expect(readFileSync("app/(dashboard)/jobs/page.tsx", "utf8")).toContain("<JobSearchPage />");
    const profilePage = readFileSync("app/(dashboard)/profile/page.tsx", "utf8");
    expect(profilePage).toContain("fixtureProfile");
    expect(profilePage).not.toContain("requireActiveUser");
  });
});
