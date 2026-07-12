import { Fragment, useEffect, useState, ReactNode } from "react";
import { Download } from "lucide-react";
import * as reportsService from "@/services/reportsService";
import { downloadCsv } from "@/utils/csv";
import { ReportsData } from "@/types/reports";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const priorityColor: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-sky-100 text-sky-700",
  HIGH: "bg-amber-100 text-amber-700",
  CRITICAL: "bg-red-100 text-red-700",
};

function Panel({
  title,
  subtitle,
  onExport,
  children,
}: {
  title: string;
  subtitle?: string;
  onExport?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <Download size={12} /> CSV
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ children }: { children: ReactNode }) {
  return <p className="py-4 text-center text-xs text-gray-400">{children}</p>;
}

export default function ReportsAnalytics() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reportsService
      .getReports()
      .then(setData)
      .catch((err) => setError(err?.response?.data?.message || "Failed to load reports"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-sm text-gray-500">Loading reports...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return null;

  const maxDeptCount = Math.max(1, ...data.departmentAllocationSummary.map((d) => d.activeAllocationCount));
  const mostUsedExportRows = data.utilization.mostUsed.map(({ category, ...asset }) => ({
    ...asset,
    categoryId: category.id,
    categoryName: category.name,
  }));
  const idleExportRows = data.utilization.idle.map(({ category, ...asset }) => ({
    ...asset,
    categoryId: category.id,
    categoryName: category.name,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          {data.scope === "department"
            ? "Scoped to the assets and activity in the department(s) you head."
            : "Organization-wide operational insight."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          title="Most-Used Assets"
          subtitle="Ranked by combined allocation + booking count"
          onExport={() => downloadCsv("most-used-assets.csv", mostUsedExportRows)}
        >
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-400">
              <tr>
                <th className="py-1">Asset</th>
                <th className="py-1">Allocations</th>
                <th className="py-1">Bookings</th>
                <th className="py-1">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.utilization.mostUsed.map((a) => (
                <tr key={a.assetId}>
                  <td className="py-1.5 font-medium text-gray-900">
                    {a.assetTag} — {a.name}
                  </td>
                  <td className="py-1.5 text-gray-600">{a.allocationCount}</td>
                  <td className="py-1.5 text-gray-600">{a.bookingCount}</td>
                  <td className="py-1.5 font-semibold text-gray-900">{a.totalUsage}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.utilization.mostUsed.length === 0 && <EmptyRow>No usage recorded yet.</EmptyRow>}
        </Panel>

        <Panel
          title="Idle Assets"
          subtitle="Never allocated or booked"
          onExport={() => downloadCsv("idle-assets.csv", idleExportRows)}
        >
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-400">
              <tr>
                <th className="py-1">Asset</th>
                <th className="py-1">Category</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.utilization.idle.map((a) => (
                <tr key={a.assetId}>
                  <td className="py-1.5 font-medium text-gray-900">
                    {a.assetTag} — {a.name}
                  </td>
                  <td className="py-1.5 text-gray-600">{a.category.name}</td>
                  <td className="py-1.5 text-gray-600">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.utilization.idle.length === 0 && <EmptyRow>No idle assets — everything's been used.</EmptyRow>}
        </Panel>

        <Panel
          title="Maintenance Frequency by Asset"
          onExport={() => downloadCsv("maintenance-by-asset.csv", data.maintenanceFrequency.byAsset)}
        >
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-400">
              <tr>
                <th className="py-1">Asset</th>
                <th className="py-1">Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.maintenanceFrequency.byAsset.map((a) => (
                <tr key={a.assetId}>
                  <td className="py-1.5 font-medium text-gray-900">
                    {a.assetTag} — {a.name}
                  </td>
                  <td className="py-1.5 text-gray-600">{a.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.maintenanceFrequency.byAsset.length === 0 && <EmptyRow>No maintenance history yet.</EmptyRow>}
        </Panel>

        <Panel
          title="Maintenance Frequency by Category"
          onExport={() => downloadCsv("maintenance-by-category.csv", data.maintenanceFrequency.byCategory)}
        >
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-400">
              <tr>
                <th className="py-1">Category</th>
                <th className="py-1">Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.maintenanceFrequency.byCategory.map((c) => (
                <tr key={c.categoryId}>
                  <td className="py-1.5 font-medium text-gray-900">{c.categoryName}</td>
                  <td className="py-1.5 text-gray-600">{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.maintenanceFrequency.byCategory.length === 0 && <EmptyRow>No maintenance history yet.</EmptyRow>}
        </Panel>

        <Panel
          title="Due for Maintenance"
          subtitle="Assets with an open (unresolved) request"
          onExport={() => downloadCsv("due-for-maintenance.csv", data.attentionNeeded.dueForMaintenance)}
        >
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-400">
              <tr>
                <th className="py-1">Asset</th>
                <th className="py-1">Open</th>
                <th className="py-1">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.attentionNeeded.dueForMaintenance.map((a) => (
                <tr key={a.assetId}>
                  <td className="py-1.5 font-medium text-gray-900">
                    {a.assetTag} — {a.name}
                  </td>
                  <td className="py-1.5 text-gray-600">{a.openRequestCount}</td>
                  <td className="py-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[a.highestPriority]}`}>
                      {a.highestPriority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.attentionNeeded.dueForMaintenance.length === 0 && <EmptyRow>Nothing outstanding.</EmptyRow>}
        </Panel>

        <Panel
          title="Nearing Retirement"
          subtitle={`Age-based heuristic — ${data.attentionNeeded.agingThresholdYears}+ years since acquisition (no retirement schedule is tracked)`}
          onExport={() => downloadCsv("aging-assets.csv", data.attentionNeeded.agingAssets)}
        >
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-400">
              <tr>
                <th className="py-1">Asset</th>
                <th className="py-1">Acquired</th>
                <th className="py-1">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.attentionNeeded.agingAssets.map((a) => (
                <tr key={a.assetId}>
                  <td className="py-1.5 font-medium text-gray-900">
                    {a.assetTag} — {a.name}
                  </td>
                  <td className="py-1.5 text-gray-600">{new Date(a.acquisitionDate).toLocaleDateString()}</td>
                  <td className="py-1.5 text-gray-600">{a.ageYears.toFixed(1)}y</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.attentionNeeded.agingAssets.length === 0 && (
            <EmptyRow>Nothing past the age threshold yet.</EmptyRow>
          )}
        </Panel>
      </div>

      <div className="mt-6">
        <Panel
          title="Department-wise Allocation Summary"
          subtitle="Active allocations right now, by department"
          onExport={() => downloadCsv("department-allocation-summary.csv", data.departmentAllocationSummary)}
        >
          <div className="space-y-2">
            {data.departmentAllocationSummary.map((d) => (
              <div key={d.departmentId} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm text-gray-700">{d.departmentName}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600"
                    style={{ width: `${(d.activeAllocationCount / maxDeptCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-semibold text-gray-900">
                  {d.activeAllocationCount}
                </span>
              </div>
            ))}
            {data.departmentAllocationSummary.length === 0 && <EmptyRow>No active department allocations.</EmptyRow>}
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Resource Booking Heatmap" subtitle="Peak usage windows — day of week x hour of day">
          {data.bookingHeatmap.maxCount === 0 ? (
            <EmptyRow>No bookings recorded yet.</EmptyRow>
          ) : (
            <div className="overflow-x-auto">
              <div className="inline-grid min-w-full grid-cols-[auto_repeat(24,minmax(20px,1fr))] gap-0.5 text-[10px]">
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="text-center text-gray-400">
                    {h}
                  </div>
                ))}
                {DAY_LABELS.map((day, dayIdx) => (
                  <Fragment key={day}>
                    <div className="pr-2 text-right text-gray-500">{day}</div>
                    {data.bookingHeatmap.matrix[dayIdx].map((count, hourIdx) => (
                      <div
                        key={`${day}-${hourIdx}`}
                        title={`${day} ${hourIdx}:00 — ${count} booking${count === 1 ? "" : "s"}`}
                        className="aspect-square rounded-sm"
                        style={{
                          backgroundColor:
                            count === 0
                              ? "var(--heatmap-empty, #f3f4f6)"
                              : `rgba(14, 165, 233, ${0.15 + 0.85 * (count / data.bookingHeatmap.maxCount)})`,
                        }}
                      />
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
