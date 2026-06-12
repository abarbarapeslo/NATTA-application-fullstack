/**
 * Domain types for the NATTA backend (the website's tRPC API on Render).
 *
 * We don't import the backend's real `AppRouter` because that lives in a
 * different repo. Instead the app uses a **vanilla tRPC client** (see
 * `lib/natta-api.ts`) and we wrap each procedure call in a typed function
 * there. This file only exposes the domain shapes.
 *
 * Keep in sync with the website repo when the backend changes.
 */

export type NattaUser = {
  id: number;
  openId: string;
  email: string | null;
  name: string | null;
  bio?: string | null;
  interests?: string[] | null;
  role: "user" | "admin";
};

export type Opportunity = {
  id: number;
  title: string;
  description: string | null;
  type: string | null;
  stage: string | null;
  region: string | null;
  mode: string | null;
  field: string | null;
  funding: string | null;
  deadline: Date | null;
  url: string | null;
  organization: string | null;
};

export type ApplicationStatus =
  | "Applied"
  | "In Progress"
  | "Accepted"
  | "Rejected";

export type Application = {
  id: number;
  userId: number;
  opportunityId: number;
  status: ApplicationStatus;
  notes: string | null;
  programStartDate: Date | null;
  programEndDate: Date | null;
  appliedAt: Date;
};

export type ApplicationWithDetails = Application & {
  opportunity: Opportunity;
};

export type SavedOpportunity = {
  id: number;
  userId: number;
  opportunityId: number;
  savedAt: Date;
  opportunity?: Opportunity;
};

export type ApplicationStats = {
  total: number;
  applied: number;
  inProgress: number;
  accepted: number;
  rejected: number;
};

export type OpportunityFilters = {
  type?: string;
  stage?: string;
  region?: string;
  mode?: string;
  field?: string;
  funding?: string;
  deadlineBefore?: Date;
  search?: string;
};
