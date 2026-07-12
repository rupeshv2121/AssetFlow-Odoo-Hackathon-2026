import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/auth";

export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-gray-500">
        <p className="text-lg font-medium text-gray-700">Access denied</p>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
}
