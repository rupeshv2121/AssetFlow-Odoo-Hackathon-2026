export type AuditCycleStatus = "OPEN" | "CLOSED";
export type AuditResult = "VERIFIED" | "MISSING" | "DAMAGED";

export interface AuditCycleSummary {
  id: string;
  name: string;
  scopeDepartmentId: string | null;
  scopeLocation: string | null;
  startDate: string;
  endDate: string;
  status: AuditCycleStatus;
  createdAt: string;
  closedAt: string | null;
  scopeDepartment: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  auditors: { auditor: { id: string; name: string } }[];
  _count: { items: number };
}

export interface AuditItemDetail {
  id: string;
  assetId: string;
  result: AuditResult | null;
  notes: string | null;
  checkedAt: string | null;
  asset: { id: string; assetTag: string; name: string; status: string; location: string | null };
}

export interface AuditCycleDetail extends AuditCycleSummary {
  items: AuditItemDetail[];
}
