/**
 * Utility functions for detecting time conflicts between applications
 */

export type Application = {
  id: string;
  name: string;
  deadline: string;
  status: "Draft" | "In Progress" | "Submitted" | "Accepted" | "Rejected";
  type: string;
  startDate?: string;
  endDate?: string;
};

export type Conflict = {
  app1: Application;
  app2: Application;
  overlapDays: number;
  overlapStart: Date;
  overlapEnd: Date;
};

/**
 * Parse date string to Date object
 * Supports formats like "Oct 25, 2024" or "2024-10-25"
 */
function parseDate(dateStr: string): Date | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}

/**
 * Check if two date ranges overlap
 */
function dateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}

/**
 * Calculate overlap period between two date ranges
 */
function calculateOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): { start: Date; end: Date; days: number } | null {
  if (!dateRangesOverlap(start1, end1, start2, end2)) {
    return null;
  }

  const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
  const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
  const overlapDays = Math.ceil(
    (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    start: overlapStart,
    end: overlapEnd,
    days: overlapDays,
  };
}

/**
 * Detect conflicts between applications
 * Only checks applications with Accepted or In Progress status
 * and valid start/end dates
 */
export function detectConflicts(applications: Application[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // Filter applications that have start and end dates
  // and are either Accepted or In Progress
  const relevantApps = applications.filter(
    (app) =>
      app.startDate &&
      app.endDate &&
      (app.status === "Accepted" || app.status === "In Progress")
  );

  // Compare each pair of applications
  for (let i = 0; i < relevantApps.length; i++) {
    for (let j = i + 1; j < relevantApps.length; j++) {
      const app1 = relevantApps[i];
      const app2 = relevantApps[j];

      const start1 = parseDate(app1.startDate!);
      const end1 = parseDate(app1.endDate!);
      const start2 = parseDate(app2.startDate!);
      const end2 = parseDate(app2.endDate!);

      if (!start1 || !end1 || !start2 || !end2) continue;

      const overlap = calculateOverlap(start1, end1, start2, end2);

      if (overlap) {
        conflicts.push({
          app1,
          app2,
          overlapDays: overlap.days,
          overlapStart: overlap.start,
          overlapEnd: overlap.end,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get conflict severity based on overlap days
 */
export function getConflictSeverity(
  overlapDays: number
): "low" | "medium" | "high" {
  if (overlapDays < 30) return "low";
  if (overlapDays < 90) return "medium";
  return "high";
}
