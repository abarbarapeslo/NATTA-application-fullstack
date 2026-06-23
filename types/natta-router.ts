/**
 * Domain types for the NATTA backend (the website's tRPC API on Render).
 *
 * Schema matches the real Supabase Postgres tables (verified 2026-05-22 via
 * information_schema.columns). When the website backend changes, update this
 * file and the screens that consume it.
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

/**
 * `deadline` is stored as a Postgres timestamp BUT the website also displays
 * non-date deadlines like "Inscrições Contínuas". For now we treat it as
 * `Date | string | null` and let the formatter decide.
 *
 * `regions` and `fields` are `jsonb` arrays of strings.
 * `opportunityType`, `stage`, `mode`, `funding`, `fee` are Postgres ENUMs.
 * `applicationLink` is the external URL ("visitar site" button on the web).
 */
export type Opportunity = {
  id: number;
  title: string;
  description: string | null;
  organizer: string | null;
  deadline: Date | string | null;
  opportunityType: string | null;
  stage: string | null;
  regions: string[] | null;
  mode: string | null;
  fields: string[] | null;
  funding: string | null;
  fee: string | null;
  fundingAmount: string | null;
  requirements: string | null;
  benefits: string | null;
  programStartDate: Date | string | null;
  programEndDate: Date | string | null;
  applicationLink: string | null;
  isFeatured: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
  programStartDate: Date | string | null;
  programEndDate: Date | string | null;
  appliedAt: Date | string;
};

/**
 * What the backend's `applications.list` actually returns: the application
 * fields PLUS a flattened subset of the related opportunity (title,
 * organizer, deadline, opportunityType, and any per-application
 * customizations like customLink). The full opportunity (description,
 * requirements, etc.) is fetched on demand via `opportunities.getById`.
 */
export type ApplicationListItem = Application & {
  title: string;
  organizer: string | null;
  deadline: Date | string | null;
  opportunityType: string | null;
  customLink: string | null;
};

/** Legacy alias — kept so older imports don't break. */
export type ApplicationWithDetails = ApplicationListItem;

export type SavedOpportunity = {
  id: number;
  userId: number;
  opportunityId: number;
  savedAt: Date | string;
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
