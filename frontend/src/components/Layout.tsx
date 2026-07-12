import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Boxes, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SIDEBAR_ITEMS, { SIDEBAR_ICONS } from "@/config/sidebar";
import { useState } from "react";

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
  return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
  }`;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const role = user?.role ?? "EMPLOYEE";
  const menu = SIDEBAR_ITEMS[role] ?? SIDEBAR_ITEMS["EMPLOYEE"];

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-gray-100 bg-white p-4">
        <div className="mb-6 flex items-center gap-2 px-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
            <Boxes size={16} />
          </span>
          <span className="text-base font-bold text-gray-900">AssetFlow</span>
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

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-gray-100 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-400">{ROLE_LABEL[role] || role}</div>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-xs font-semibold text-indigo-700">
              {initials(user?.name)}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
