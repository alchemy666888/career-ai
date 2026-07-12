import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("disabled auth pages", () => {
  it("keeps signup links defined without redirect imports", () => {
    const source = readFileSync("app/(auth)/signup/page.tsx", "utf8");
    expect(source).toContain('import Link from "next/link"');
    expect(source).not.toContain('import { redirect }');
    expect(source).toContain('href="/jobs"');
  });
});
