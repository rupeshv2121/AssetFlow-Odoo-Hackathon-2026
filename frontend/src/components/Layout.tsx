import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Placeholder shell so auth is demoable end-to-end. Dev C: replace with the
// real sidebar nav (role-aware menu items) + topbar (notification bell) here.
export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
        <p className="mb-6 text-lg font-semibold text-gray-900">AssetFlow</p>
        <nav className="space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Dashboard
          </NavLink>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-700">{user?.name}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {user?.role}
            </span>
            <button
              onClick={logout}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
