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
