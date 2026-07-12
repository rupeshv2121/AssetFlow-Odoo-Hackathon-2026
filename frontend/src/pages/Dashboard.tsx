import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  Repeat2,
  Wrench,
  CalendarClock,
  ArrowLeftRight,
  Clock,
  AlertTriangle,
  PackagePlus,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as dashboardService from "@/services/dashboardService";
import { DashboardData } from "@/types/dashboard";
import { AssetStatus } from "@/types/asset";

const STATUS_COLOR_HEX: Record<AssetStatus, string> = {
  AVAILABLE: "#10b981",
  ALLOCATED: "#0ea5e9",
  RESERVED: "#8b5cf6",
  UNDER_MAINTENANCE: "#f59e0b",
  LOST: "#f43f5e",
  RETIRED: "#9ca3af",
  DISPOSED: "#d1d5db",
};

const STATUS_LABEL: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  ALLOCATED: "Allocated",
  RESERVED: "Reserved",
  UNDER_MAINTENANCE: "Under Maintenance",
  LOST: "Lost",
  RETIRED: "Retired",
  DISPOSED: "Disposed",
};

function buildConicGradient(data: { status: AssetStatus; count: number }[]) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return "#e5e7eb";
  let acc = 0;
  const stops: string[] = [];
  for (const d of data) {
    if (d.count === 0) continue;
    const start = (acc / total) * 360;
    acc += d.count;
    const end = (acc / total) * 360;
    stops.push(`${STATUS_COLOR_HEX[d.status]} ${start}deg ${end}deg`);
  }
  return `conic-gradient(${stops.join(", ")})`;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Boxes;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon size={18} />
      </div>
      <div className="mt-4 text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const canRegisterAsset = user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then(setData)
      .catch((err) => setError(err?.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setIsLoading(false));
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Welcome back, {user?.name?.split(" ")[0]}!</h1>
        <p className="mt-1 text-sm text-gray-500">Today is {today}</p>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading dashboard...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {data && data.scope !== "personal" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard icon={Boxes} label="Assets Available" value={data.kpis.assetsAvailable} color="bg-emerald-50 text-emerald-600" />
            <KpiCard icon={Repeat2} label="Assets Allocated" value={data.kpis.assetsAllocated} color="bg-sky-50 text-sky-600" />
            <KpiCard icon={Wrench} label="Maintenance Active" value={data.kpis.maintenanceActive} color="bg-amber-50 text-amber-600" />
            <KpiCard icon={CalendarClock} label="Active Bookings" value={data.kpis.activeBookings} color="bg-violet-50 text-violet-600" />
            <KpiCard icon={ArrowLeftRight} label="Pending Transfers" value={data.kpis.pendingTransfers} color="bg-indigo-50 text-indigo-600" />
            <KpiCard icon={Clock} label="Upcoming Returns" value={data.kpis.upcomingReturns} color="bg-rose-50 text-rose-600" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:col-span-1">
              <h2 className="text-sm font-semibold text-gray-900">Assets by Status</h2>
              <div className="mt-6 flex items-center justify-center">
                <div
                  className="relative flex h-40 w-40 items-center justify-center rounded-full"
                  style={{ background: buildConicGradient(data.assetsByStatus) }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {data.assetsByStatus.reduce((s, d) => s + d.count, 0)}
                    </span>
                    <span className="text-xs text-gray-400">Total Assets</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {data.assetsByStatus
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <div key={s.status} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: STATUS_COLOR_HEX[s.status] }}
                        />
                        {STATUS_LABEL[s.status]}
                      </span>
                      <span className="font-semibold text-gray-900">{s.count}</span>
                    </div>
                  ))}
                {data.assetsByStatus.every((s) => s.count === 0) && (
                  <p className="text-sm text-gray-400">No assets registered yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:col-span-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <h2 className="text-sm font-semibold text-gray-900">Overdue Returns</h2>
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2">Asset</th>
                      <th className="px-4 py-2">Held By</th>
                      <th className="px-4 py-2">Expected Return</th>
                      <th className="px-4 py-2">Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.overdueReturns.map((o) => (
                      <tr key={o.id}>
                        <td className="px-4 py-2">
                          <Link to={`/assets/${o.asset.id}`} className="font-medium text-gray-900 hover:underline">
                            {o.asset.assetTag} — {o.asset.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-600">{o.holder}</td>
                        <td className="px-4 py-2 text-gray-600">
                          {o.expectedReturnDate ? new Date(o.expectedReturnDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-2">
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                            {o.daysOverdue}d overdue
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.overdueReturns.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                          Nothing overdue right now.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {data && data.scope === "personal" && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <KpiCard icon={Boxes} label="My Assets" value={data.kpis.myAssets} color="bg-emerald-50 text-emerald-600" />
            <KpiCard icon={CalendarClock} label="Active Bookings" value={data.kpis.activeBookings} color="bg-violet-50 text-violet-600" />
            <KpiCard icon={Wrench} label="Open Maintenance" value={data.kpis.openMaintenance} color="bg-amber-50 text-amber-600" />
            <KpiCard icon={ArrowLeftRight} label="Pending Transfers" value={data.kpis.pendingTransfers} color="bg-indigo-50 text-indigo-600" />
            <KpiCard icon={Clock} label="Upcoming Returns" value={data.kpis.upcomingReturns} color="bg-rose-50 text-rose-600" />
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500" />
              <h2 className="text-sm font-semibold text-gray-900">Overdue Returns</h2>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Asset</th>
                    <th className="px-4 py-2">Expected Return</th>
                    <th className="px-4 py-2">Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.overdueReturns.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-2">
                        <Link to={`/assets/${o.asset.id}`} className="font-medium text-gray-900 hover:underline">
                          {o.asset.assetTag} — {o.asset.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {o.expectedReturnDate ? new Date(o.expectedReturnDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                          {o.daysOverdue}d overdue
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.overdueReturns.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                        Nothing overdue right now.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {canRegisterAsset && (
            <Link
              to="/assets"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-sky-700 hover:to-indigo-700"
            >
              <PackagePlus size={16} /> Register Asset
            </Link>
          )}
          <Link
            to="/bookings"
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <CalendarClock size={16} /> Book Resource
          </Link>
          <Link
            to="/maintenance"
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ClipboardList size={16} /> Raise Maintenance Request
          </Link>
        </div>
      </div>
    </div>
  );
}
