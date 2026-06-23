import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * The Home dashboard reads/writes applications through the NATTA backend
 * (see `hooks/use-applications.ts` + `lib/natta-api.ts`). Each application is
 * tied to a real `opportunityId` — the old free-form "create application"
 * flow backed by AsyncStorage was removed by product decision.
 *
 * These are structural tests over the current implementation so the suite
 * fails loudly if the data source regresses back to local storage.
 */
const dashboardContent = fs.readFileSync(
  path.join(__dirname, "../app/(tabs)/index.tsx"),
  "utf-8",
);

describe("Natta - Applications Feature", () => {
  it("loads applications from the NATTA backend via useApplications", () => {
    expect(dashboardContent).toContain("useApplications");
    expect(dashboardContent).toContain("@/hooks/use-applications");
  });

  it("uses the current application status options", () => {
    expect(dashboardContent).toContain('"Applied"');
    expect(dashboardContent).toContain('"In Progress"');
    expect(dashboardContent).toContain('"Accepted"');
    expect(dashboardContent).toContain('"Rejected"');
  });

  it("no longer uses AsyncStorage for application persistence", () => {
    expect(dashboardContent).not.toContain("AsyncStorage");
    expect(dashboardContent).not.toContain('"applications"');
  });

  it("does not have progress bars in application cards", () => {
    expect(dashboardContent).not.toContain("ProgressBar");
    expect(dashboardContent).not.toContain("progress:");
  });

  it("guides users to browse opportunities instead of manual creation", () => {
    expect(dashboardContent).toContain("home.browseOpportunities");
    expect(dashboardContent).not.toContain("saveApplication");
  });

  it("displays an empty state when there are no applications", () => {
    expect(dashboardContent).toContain("home.noApplications");
    expect(dashboardContent).toContain("applications.length === 0");
  });

  it("supports editing status and removing an application", () => {
    expect(dashboardContent).toContain("updateStatus");
    expect(dashboardContent).toContain("removeApplication");
    expect(dashboardContent).toContain("home.updateStatus");
  });
});
