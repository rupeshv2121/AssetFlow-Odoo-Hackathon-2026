import {
  LayoutDashboard,
  Building2,
  Users,
  Tags,
  Boxes,
  PackagePlus,
  Repeat2,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardList,
  BarChart3,
  Bell,
  Settings,
  UserCircle,
  History,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type MenuItem = {
  key: string;
  title: string;
  path?: string;
  children?: MenuItem[];
};

// Looked up by key rather than embedded per-item so the menu tree above
// stays plain data (keeps this file .ts, not .tsx).
export const SIDEBAR_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  organization: Building2,
  departments: Building2,
  employees: Users,
  assetCategories: Tags,
  assetInventory: Boxes,
  registerAsset: PackagePlus,
  assetAllocation: Repeat2,
  transferRequests: ArrowLeftRight,
  resourceBooking: CalendarClock,
  maintenance: Wrench,
  maintenanceRequests: Wrench,
  assetAudit: ShieldCheck,
  auditLogs: ClipboardList,
  reports: BarChart3,
  notifications: Bell,
  settings: Settings,
  profile: UserCircle,
  allocationHistory: History,
  departmentEmployees: Users,
  departmentAssets: Boxes,
  assetRequests: ClipboardList,
  departmentReports: BarChart3,
  myAssets: Boxes,
  requestTransfer: ArrowLeftRight,
  raiseMaintenance: Wrench,
  bookResources: CalendarClock,
  myRequests: ClipboardList,
};

export const SIDEBAR_ITEMS: Record<string, MenuItem[]> = {
  ADMIN: [
    { key: "dashboard", title: "Dashboard", path: "/dashboard" },
    { key: "organization", title: "Organization", path: "/org-setup" },
    { key: "assetInventory", title: "Asset Inventory", path: "/assets" },
    { key: "assetAllocation", title: "Asset Allocation", path: "/allocations" },
    { key: "transferRequests", title: "Transfer Requests", path: "/transfers" },
    { key: "resourceBooking", title: "Resource Booking", path: "/bookings" },
    { key: "maintenance", title: "Maintenance", path: "/maintenance" },
    { key: "assetAudit", title: "Asset Audit", path: "/audits" },
    { key: "auditLogs", title: "Audit Logs", path: "/audit-logs" },
    { key: "reports", title: "Reports & Analytics", path: "/reports" },
    { key: "settings", title: "Settings", path: "/settings" },
  ],

  ASSET_MANAGER: [
    { key: "dashboard", title: "Dashboard", path: "/dashboard" },
    { key: "assetInventory", title: "Asset Inventory", path: "/assets" },
    { key: "assetAllocation", title: "Asset Allocation", path: "/allocations" },
    { key: "transferRequests", title: "Transfer Requests", path: "/transfers" },
    { key: "resourceBooking", title: "Resource Booking", path: "/bookings" },
    { key: "maintenanceRequests", title: "Maintenance Requests", path: "/maintenance" },
    { key: "assetAudit", title: "Asset Audit", path: "/audits" },
  ],

  DEPARTMENT_HEAD: [
    { key: "dashboard", title: "Dashboard", path: "/dashboard" },
    { key: "departmentEmployees", title: "Department Employees", path: "/department/employees" },
    { key: "departmentAssets", title: "Department Assets", path: "/department/assets" },
    { key: "resourceBooking", title: "Resource Booking", path: "/bookings" },
    { key: "assetRequests", title: "Asset Requests", path: "/requests" },
    { key: "assetAudit", title: "Asset Audit", path: "/audits" },
    { key: "departmentReports", title: "Department Reports", path: "/reports/department" },
  ],

  EMPLOYEE: [
    { key: "dashboard", title: "Dashboard", path: "/dashboard" },
    { key: "myAssets", title: "My Assets", path: "/my-assets" },
    { key: "requestTransfer", title: "Request Transfer", path: "/requests/transfer" },
    { key: "raiseMaintenance", title: "Raise Maintenance", path: "/requests/maintenance" },
    { key: "bookResources", title: "Book Resources", path: "/bookings" },
    { key: "myRequests", title: "My Requests", path: "/my-requests" },
    { key: "assetAudit", title: "Asset Audit", path: "/audits" },
  ],
};

export default SIDEBAR_ITEMS;
