export type AssetStatus =
  | "AVAILABLE"
  | "ALLOCATED"
  | "RESERVED"
  | "UNDER_MAINTENANCE"
  | "LOST"
  | "RETIRED"
  | "DISPOSED";

export interface CurrentHolder {
  id: string;
  expectedReturnDate: string | null;
  employee: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: { id: string; name: string };
  serialNumber: string | null;
  status: AssetStatus;
  location: string | null;
  condition: string | null;
  isBookable: boolean;
  acquisitionDate: string | null;
  acquisitionCost: string | null;
  photoUrl: string | null;
  createdAt: string;
  allocations: CurrentHolder[];
}

export interface AllocationHistoryEntry {
  id: string;
  allocatedAt: string;
  expectedReturnDate: string | null;
  returnedAt: string | null;
  returnCondition: string | null;
  status: "ACTIVE" | "RETURN_REQUESTED" | "RETURNED";
  employee: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
}

export interface MaintenanceHistoryEntry {
  id: string;
  issueDescription: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  raisedBy: { id: string; name: string };
}

export interface AssetDetail extends Omit<Asset, "allocations"> {
  allocations: AllocationHistoryEntry[];
  maintenanceRequests: MaintenanceHistoryEntry[];
}
