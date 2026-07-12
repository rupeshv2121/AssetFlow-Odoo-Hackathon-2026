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
    {
      key: "organization",
      title: "Organization",
      children: [
        { key: "departments", title: "Departments", path: "/org-setup?tab=departments" },
        { key: "employees", title: "Employees", path: "/org-setup?tab=employees" },
        { key: "assetCategories", title: "Asset Categories", path: "/org-setup?tab=categories" },
      ],
    },
    { key: "assetInventory", title: "Asset Inventory", path: "/assets" },
    { key: "assetAllocation", title: "Asset Allocation", path: "/allocations" },
    { key: "transferRequests", title: "Transfer Requests", path: "/transfers" },
    { key: "resourceBooking", title: "Resource Booking", path: "/bookings" },
    { key: "maintenance", title: "Maintenance", path: "/maintenance" },
    { key: "auditLogs", title: "Audit Logs", path: "/audit-logs" },
    { key: "reports", title: "Reports & Analytics", path: "/reports" },
    { key: "notifications", title: "Notifications", path: "/notifications" },
    { key: "settings", title: "Settings", path: "/settings" },
    { key: "profile", title: "Profile", path: "/profile" },
  ],

  ASSET_MANAGER: [
    { key: "dashboard", title: "Dashboard", path: "/dashboard" },
    { key: "assetInventory", title: "Asset Inventory", path: "/assets" },
    { key: "registerAsset", title: "Register Asset", path: "/assets/register" },
    { key: "assetAllocation", title: "Asset Allocation", path: "/allocations" },
    { key: "transferRequests", title: "Transfer Requests", path: "/transfers" },
    { key: "resourceBooking", title: "Resource Booking", path: "/bookings" },
    { key: "maintenanceRequests", title: "Maintenance Requests", path: "/maintenance" },
    { key: "allocationHistory", title: "Allocation History", path: "/allocations/history" },
    { key: "notifications", title: "Notifications", path: "/notifications" },
    { key: "profile", title: "Profile", path: "/profile" },
  ],

  DEPARTMENT_HEAD: [
    { key: "dashboard", title: "Dashboard", path: "/dashboard" },
    { key: "departmentEmployees", title: "Department Employees", path: "/department/employees" },
    { key: "departmentAssets", title: "Department Assets", path: "/department/assets" },
    { key: "resourceBooking", title: "Resource Booking", path: "/bookings" },
    { key: "assetRequests", title: "Asset Requests", path: "/requests" },
    { key: "departmentReports", title: "Department Reports", path: "/reports/department" },
    { key: "notifications", title: "Notifications", path: "/notifications" },
    { key: "profile", title: "Profile", path: "/profile" },
  ],

  EMPLOYEE: [
    { key: "dashboard", title: "Dashboard", path: "/dashboard" },
    { key: "myAssets", title: "My Assets", path: "/my-assets" },
    { key: "requestTransfer", title: "Request Transfer", path: "/requests/transfer" },
    { key: "raiseMaintenance", title: "Raise Maintenance", path: "/requests/maintenance" },
    { key: "bookResources", title: "Book Resources", path: "/bookings" },
    { key: "myRequests", title: "My Requests", path: "/my-requests" },
    { key: "notifications", title: "Notifications", path: "/notifications" },
    { key: "profile", title: "Profile", path: "/profile" },
  ],
};

export default SIDEBAR_ITEMS;
