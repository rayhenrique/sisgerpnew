import { describe, expect, it } from "vitest";

import { findReportDefinition, REPORT_DEFINITIONS } from "./catalog";

describe("catalog", () => {
  it("exibe definições", () => {
    expect(REPORT_DEFINITIONS.length).toBeGreaterThan(0);
  });

  it("busca por key", () => {
    expect(findReportDefinition("transactions")?.key).toEqual("transactions");
    expect(findReportDefinition("__invalid__")).toBeNull();
  });
});

