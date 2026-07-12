import { BarChart, Circle, List, Wrench, CheckSquare } from "lucide-react";

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-2 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <div className="w-full max-w-2xl rounded-xl bg-gradient-to-b from-white to-gray-50 p-4 shadow-lg">
      <div className="flex gap-4">
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="Assets" value="1,248" />
            <StatCard title="Allocations" value="342" />
            <StatCard title="Maint. Req." value="27" />
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle className="text-sky-600" size={18} />
                <div className="text-sm font-medium">Asset Status</div>
              </div>
              <div className="text-xs text-gray-500">Last 30d</div>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <div className="h-28 w-full rounded bg-gradient-to-r from-sky-50 to-sky-100 p-3">
                <BarChart className="text-sky-500" />
              </div>
              <div className="w-32 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Available</span>
                  <span className="font-semibold text-emerald-600">72%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>In Use</span>
                  <span className="font-semibold text-sky-600">18%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Maintenance</span>
                  <span className="font-semibold text-amber-600">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-72 space-y-3">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <List size={16} /> <span>Recent Activity</span>
              </div>
              <span className="text-xs text-gray-400">Now</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckSquare className="text-emerald-500" size={14} /> Asset A moved to Sales
              </li>
              <li className="flex items-start gap-2">
                <Wrench className="text-amber-500" size={14} /> Maintenance scheduled for Asset D
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-sm text-gray-600">Active Allocations</div>
            <div className="mt-2 space-y-2 text-sm text-gray-800">
              <div className="flex items-center justify-between">
                <span className="truncate">Laptop — Finance</span>
                <span className="text-xs text-gray-500">2d</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate">Projector — Sales</span>
                <span className="text-xs text-gray-500">7d</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
