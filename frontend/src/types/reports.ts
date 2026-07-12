export interface UsageRow {
  assetId: string;
  assetTag: string;
  name: string;
  status: string;
  category: { id: string; name: string };
  acquisitionDate: string | null;
  allocationCount: number;
  bookingCount: number;
  maintenanceCount: number;
  totalUsage: number;
}

export interface MaintenanceByAssetRow {
  assetId: string;
  assetTag: string;
  name: string;
  count: number;
}

export interface MaintenanceByCategoryRow {
  categoryId: string;
  categoryName: string;
  count: number;
}

export interface DueForMaintenanceRow {
  assetId: string;
  assetTag: string;
  name: string;
  openRequestCount: number;
  highestPriority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface AgingAssetRow {
  assetId: string;
  assetTag: string;
  name: string;
  acquisitionDate: string;
  ageYears: number;
}

export interface DepartmentAllocationRow {
  departmentId: string;
  departmentName: string;
  activeAllocationCount: number;
}

export interface ReportsData {
  scope: "organization" | "department";
  utilization: { mostUsed: UsageRow[]; idle: UsageRow[] };
  maintenanceFrequency: { byAsset: MaintenanceByAssetRow[]; byCategory: MaintenanceByCategoryRow[] };
  attentionNeeded: {
    dueForMaintenance: DueForMaintenanceRow[];
    agingAssets: AgingAssetRow[];
    agingThresholdYears: number;
  };
  departmentAllocationSummary: DepartmentAllocationRow[];
  bookingHeatmap: { matrix: number[][]; maxCount: number };
}
