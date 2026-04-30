import { describe, it, expect } from "vitest";
import {
  detectConflicts,
  formatDate,
  getConflictSeverity,
  type Application,
} from "../lib/conflict-detector";

describe("Conflict Detector", () => {
  it("should detect conflicts between two overlapping applications", () => {
    const applications: Application[] = [
      {
        id: "1",
        name: "Fellowship Program",
        deadline: "Jan 1, 2025",
        status: "Accepted",
        type: "Fellowship",
        startDate: "Feb 1, 2025",
        endDate: "Jun 30, 2025",
      },
      {
        id: "2",
        name: "Exchange Program",
        deadline: "Jan 15, 2025",
        status: "Accepted",
        type: "Exchange",
        startDate: "May 1, 2025",
        endDate: "Aug 31, 2025",
      },
    ];

    const conflicts = detectConflicts(applications);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].app1.name).toBe("Fellowship Program");
    expect(conflicts[0].app2.name).toBe("Exchange Program");
    expect(conflicts[0].overlapDays).toBeGreaterThan(0);
  });

  it("should not detect conflicts for non-overlapping applications", () => {
    const applications: Application[] = [
      {
        id: "1",
        name: "Summer Internship",
        deadline: "Jan 1, 2025",
        status: "Accepted",
        type: "Internship",
        startDate: "Jun 1, 2025",
        endDate: "Aug 31, 2025",
      },
      {
        id: "2",
        name: "Fall Research",
        deadline: "Jan 15, 2025",
        status: "Accepted",
        type: "Research",
        startDate: "Sep 1, 2025",
        endDate: "Dec 31, 2025",
      },
    ];

    const conflicts = detectConflicts(applications);
    expect(conflicts).toHaveLength(0);
  });

  it("should only check Accepted or In Progress applications", () => {
    const applications: Application[] = [
      {
        id: "1",
        name: "Fellowship Program",
        deadline: "Jan 1, 2025",
        status: "Draft",
        type: "Fellowship",
        startDate: "Feb 1, 2025",
        endDate: "Jun 30, 2025",
      },
      {
        id: "2",
        name: "Exchange Program",
        deadline: "Jan 15, 2025",
        status: "Submitted",
        type: "Exchange",
        startDate: "May 1, 2025",
        endDate: "Aug 31, 2025",
      },
    ];

    const conflicts = detectConflicts(applications);
    expect(conflicts).toHaveLength(0);
  });

  it("should ignore applications without start or end dates", () => {
    const applications: Application[] = [
      {
        id: "1",
        name: "Fellowship Program",
        deadline: "Jan 1, 2025",
        status: "Accepted",
        type: "Fellowship",
        startDate: "Feb 1, 2025",
        // Missing endDate
      },
      {
        id: "2",
        name: "Exchange Program",
        deadline: "Jan 15, 2025",
        status: "Accepted",
        type: "Exchange",
        // Missing startDate
        endDate: "Aug 31, 2025",
      },
    ];

    const conflicts = detectConflicts(applications);
    expect(conflicts).toHaveLength(0);
  });

  it("should correctly classify conflict severity", () => {
    expect(getConflictSeverity(20)).toBe("low");
    expect(getConflictSeverity(50)).toBe("medium");
    expect(getConflictSeverity(100)).toBe("high");
  });

  it("should format dates correctly", () => {
    const date = new Date(2025, 1, 18); // Month is 0-indexed, so 1 = February
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Feb/);
    expect(formatted).toMatch(/18/);
    expect(formatted).toMatch(/2025/);
  });

  it("should detect multiple conflicts", () => {
    const applications: Application[] = [
      {
        id: "1",
        name: "Program A",
        deadline: "Jan 1, 2025",
        status: "Accepted",
        type: "Fellowship",
        startDate: "Feb 1, 2025",
        endDate: "Jun 30, 2025",
      },
      {
        id: "2",
        name: "Program B",
        deadline: "Jan 15, 2025",
        status: "Accepted",
        type: "Exchange",
        startDate: "May 1, 2025",
        endDate: "Aug 31, 2025",
      },
      {
        id: "3",
        name: "Program C",
        deadline: "Jan 20, 2025",
        status: "Accepted",
        type: "Research",
        startDate: "Apr 1, 2025",
        endDate: "Jul 31, 2025",
      },
    ];

    const conflicts = detectConflicts(applications);
    // Program A overlaps with B and C
    // Program B overlaps with A and C
    // Program C overlaps with A and B
    // Total: 3 unique conflict pairs (A-B, A-C, B-C)
    expect(conflicts.length).toBeGreaterThanOrEqual(3);
  });
});
