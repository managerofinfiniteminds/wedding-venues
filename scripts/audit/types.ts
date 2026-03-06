export type AuditSeverity = "critical" | "warning" | "info";
export type AuditStatus = "unaudited" | "clean" | "needs_review" | "flagged";

export interface AuditFlag {
  type: string;
  severity: AuditSeverity;
  field: string;
  detail: string;
  autoFixed: boolean;
  fixDetail?: string;
}

export interface VenueAuditResult {
  id: string;
  name: string;
  city: string;
  auditScore: number;
  auditStatus: AuditStatus;
  flags: AuditFlag[];
  autoFixesApplied: number;
  wasPublished: boolean;
  isPublished: boolean;
}

export interface AuditRunSummary {
  runAt: string;
  cities: string[];
  totalVenues: number;
  clean: number;
  needsReview: number;
  flagged: number;
  totalFlags: number;
  criticalFlags: number;
  warningFlags: number;
  autoFixesApplied: number;
  results: VenueAuditResult[];
}
