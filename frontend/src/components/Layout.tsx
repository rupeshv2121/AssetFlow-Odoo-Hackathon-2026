import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { Boxes, LogOut, ChevronDown, Bell, UserCircle, ChevronRight, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SIDEBAR_ITEMS, { SIDEBAR_ICONS } from "@/config/sidebar";
import { useEffect, useRef, useState } from "react";
import * as activityService from "@/services/activityService";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  ASSET_MANAGER: "Asset Manager",
  DEPARTMENT_HEAD: "Department Head",
  EMPLOYEE: "Employee",
};

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-sky-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
    }`;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const role = user?.role ?? "EMPLOYEE";
  const menu = SIDEBAR_ITEMS[role] ?? SIDEBAR_ITEMS["EMPLOYEE"];
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [expanded, setExpanded] = useState<string[]>(() => {
    // Automatically expand the section if a child is active
    const initialExpanded: string[] = [];
    menu.forEach((item) => {
      if (item.children?.some((child) => location.pathname.startsWith((child.path || "").split("?")[0]))) {
        initialExpanded.push(item.key);
      }
    });
    return initialExpanded;
  });

  const toggleExpand = (key: string) => {
    setExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    activityService
      .getActivityCenter()
      .then((data) => setUnreadCount(data.unreadNotificationCount))
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-gray-100 bg-white p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="mb-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-700 text-white">
              <Boxes size={16} />
            </span>
            <span className="text-base font-bold text-gray-900">AssetFlow</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = SIDEBAR_ICONS[item.key];
            const isExpanded = expanded.includes(item.key);

            return (
              <div key={item.key}>
                {item.path ? (
                  <NavLink to={item.path} className={navLinkClass}>
                    {Icon && <Icon size={16} />}
                    {item.title}
                  </NavLink>
                ) : item.children ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.key)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2.5">
                      {Icon && <Icon size={16} />}
                      {item.title}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <div className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {item.title}
                  </div>
                )}

                {item.children && isExpanded && (
                  <div className="mt-1 space-y-1 pl-2">
                    {item.children.map((c) => {
                      const ChildIcon = SIDEBAR_ICONS[c.key];
                      return (
                        <NavLink key={c.key} to={c.path || "#"} className={navLinkClass}>
                          {ChildIcon && <ChildIcon size={16} />}
                          {c.title}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut size={16} />
          Log out
        </button>
      </aside>

      <div className="flex flex-1 flex-col lg:ml-60 min-w-0 overflow-x-hidden">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-3 lg:justify-end">
          {/* Mobile Drawer Trigger & Logo Only */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-700 text-white shadow-sm">
                <Boxes size={16} />
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="relative flex items-center rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              aria-label="Open notifications"
            >
              <Bell size={16} />
              <span className="hidden sm:inline"></span>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <div
              ref={profileMenuRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="flex items-center gap-3 rounded-full px-2 py-1.5 text-left hover:bg-gray-50"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-400">{ROLE_LABEL[role] || role}</div>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-xs font-semibold text-indigo-700">
                  {initials(user?.name)}
                </span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg ring-1 ring-black/5">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-2">
                        <UserCircle size={16} /> Profile
                      </span>
                      <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
