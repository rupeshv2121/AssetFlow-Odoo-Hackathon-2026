export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type MaintenanceStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "TECHNICIAN_ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED";

export interface MaintenanceRequestItem {
  id: string;
  assetId: string;
  raisedById: string;
  issueDescription: string;
  priority: MaintenancePriority;
  photoUrl: string | null;
  status: MaintenanceStatus;
  approvedById: string | null;
  technicianName: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  asset: { id: string; assetTag: string; name: string; status: string };
  raisedBy: { id: string; name: string };
  approvedBy: { id: string; name: string } | null;
}
