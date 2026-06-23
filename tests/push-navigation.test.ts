import { describe, expect, it } from "vitest";
import { opportunityIdFromPush } from "../lib/push-data";

describe("push-navigation", () => {
  it("parses opportunityId from push data", () => {
    expect(
      opportunityIdFromPush({ data: { opportunityId: "42" } } as any),
    ).toBe(42);
  });

  it("returns null for missing or invalid opportunityId", () => {
    expect(opportunityIdFromPush({ data: {} } as any)).toBeNull();
    expect(
      opportunityIdFromPush({ data: { opportunityId: "abc" } } as any),
    ).toBeNull();
  });
});
