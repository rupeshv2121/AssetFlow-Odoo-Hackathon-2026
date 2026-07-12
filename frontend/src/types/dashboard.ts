import { AssetStatus } from "@/types/asset";

export interface OverdueReturn {
  id: string;
  asset: { id: string; assetTag: string; name: string };
  holder: string;
  expectedReturnDate: string | null;
  daysOverdue: number;
}

export interface AssetStatusCount {
  status: AssetStatus;
  count: number;
}

export interface OrgDashboard {
  scope: "organization" | "department";
  kpis: {
    assetsAvailable: number;
    assetsAllocated: number;
    maintenanceActive: number;
    activeBookings: number;
    pendingTransfers: number;
    upcomingReturns: number;
  };
  overdueReturns: OverdueReturn[];
  assetsByStatus: AssetStatusCount[];
  departmentCount: number;
  employeeCount: number;
}

export interface PersonalDashboard {
  scope: "personal";
  kpis: {
    myAssets: number;
    activeBookings: number;
    openMaintenance: number;
    pendingTransfers: number;
    upcomingReturns: number;
  };
  overdueReturns: OverdueReturn[];
  assetsByStatus: [];
}

export type DashboardData = OrgDashboard | PersonalDashboard;
