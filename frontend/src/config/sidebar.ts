import { ReactNode } from "react";

export type MenuItem = {
  key: string;
  title: string;
  path?: string;
  children?: MenuItem[];
  icon?: ReactNode;
};

export const SIDEBAR_ITEMS: Record<string, MenuItem[]> = {
  ADMIN: [
    { key: "dashboard", title: "Dashboard", path: "/dashboard" },
    {
      key: "organization",
      title: "Organization",
      children: [
        { key: "departments", title: "Departments", path: "/org/departments" },
        { key: "employees", title: "Employees", path: "/org/employees" },
        { key: "assetCategories", title: "Asset Categories", path: "/org/asset-categories" },
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
