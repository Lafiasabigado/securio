import { describe, expect, it } from "vitest";
import { computeScanScore } from "../src/rules.js";
import type { Finding } from "../src/types.js";

function finding(partial: Partial<Finding> & Pick<Finding, "status" | "severity">): Finding {
  return {
    id: partial.id ?? "test",
    category: "headers",
    categoryTitle: "En-têtes de sécurité",
    title: partial.title ?? "test",
    description: "",
    importance: "",
    recommendation: "",
    ...partial,
  };
}

describe("computeScanScore", () => {
  it("starts at 100 with only passing findings", () => {
    const result = computeScanScore([finding({ status: "pass", severity: "low" })]);
    expect(result.score).toBe(100);
    expect(result.grade).toBe("A+");
  });

  it("applies a heavier penalty to fails than to warnings", () => {
    const failed = computeScanScore([finding({ status: "fail", severity: "high" })]);
    const warned = computeScanScore([finding({ status: "warning", severity: "high" })]);
    expect(failed.score).toBeLessThan(warned.score);
    expect(failed.score).toBe(85);
  });
});
