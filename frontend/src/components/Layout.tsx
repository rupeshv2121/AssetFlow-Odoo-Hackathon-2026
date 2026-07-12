import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import SIDEBAR_ITEMS from "@/config/sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";

// Role-based sidebar that renders menu items from a data-driven config.
export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const role = user?.role ?? "EMPLOYEE";
  const menu = SIDEBAR_ITEMS[role] ?? SIDEBAR_ITEMS["EMPLOYEE"];

  const [expanded, setExpanded] = useState<string[]>(() => {
    // Automatically expand the section if a child is active
    const initialExpanded: string[] = [];
    menu.forEach(item => {
      if (item.children?.some(child => location.pathname.startsWith(child.path || ''))) {
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
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
        <p className="mb-6 text-lg font-semibold text-gray-900">AssetFlow</p>

        <nav className="space-y-2">
          {menu.map((item) => {
            const isExpanded = expanded.includes(item.key);
            return (
              <div key={item.key}>
                {item.path ? (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                ) : (
                  <button
                    onClick={() => toggleExpand(item.key)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    <span>{item.title}</span>
                    {item.children && (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )
                    )}
                  </button>
                )}

                {item.children && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.key}
                        to={c.path || "#"}
                        className={({ isActive }) =>
                          `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`
                        }
                      >
                        {c.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
              className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
