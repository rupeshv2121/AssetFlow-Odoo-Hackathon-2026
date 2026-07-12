import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import OrgSetup from "@/pages/OrgSetup";
import Landing from "@/pages/Landing";
import AssetDirectory from "@/pages/AssetDirectory";
import AssetDetail from "@/pages/AssetDetail";
import AssetAllocation from "@/pages/AssetAllocation";
import AllocationRequests from "@/pages/AllocationRequests";
import Placeholder from "@/pages/placeholders/Placeholder";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<AssetDirectory />} />
          <Route path="/assets/:id" element={<AssetDetail />} />

          {/* Placeholder routes for role-based sidebar modules */}
          <Route path="/bookings" element={<Placeholder title="Resource Booking" />} />
          <Route path="/maintenance" element={<Placeholder title="Maintenance" />} />
          <Route path="/audit-logs" element={<Placeholder title="Audit Logs" />} />
          <Route path="/reports" element={<Placeholder title="Reports & Analytics" />} />
          <Route path="/notifications" element={<Placeholder title="Notifications" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="/profile" element={<Placeholder title="Profile" />} />

          <Route path="/assets/register" element={<Navigate to="/assets" replace />} />
          <Route path="/allocations" element={<AssetAllocation />} />
          <Route path="/allocations/history" element={<AssetAllocation />} />
          <Route path="/department/employees" element={<Placeholder title="Department Employees" />} />
          <Route path="/department/assets" element={<AssetAllocation />} />
          <Route path="/transfers" element={<AllocationRequests />} />
          <Route path="/requests" element={<AllocationRequests />} />
          <Route path="/reports/department" element={<Placeholder title="Department Reports" />} />
          <Route path="/my-assets" element={<AssetAllocation />} />
          <Route path="/requests/transfer" element={<AllocationRequests />} />
          <Route path="/requests/maintenance" element={<Placeholder title="Raise Maintenance" />} />
          <Route path="/my-requests" element={<AllocationRequests />} />

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/org-setup" element={<OrgSetup />} />
          </Route>

          {/* Other devs: add your module's routes here, e.g.
              <Route path="/bookings" element={<Bookings />} /> */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
