import { motion } from "framer-motion";
import { List, Wrench, CheckSquare, Boxes, UserCheck, Activity, LucideIcon } from "lucide-react";

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  change?: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm relative overflow-hidden group cursor-default"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg} ${iconColor} transition-transform group-hover:scale-110`}>
            <Icon size={14} />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-lg font-bold text-gray-900 tracking-tight">{value}</span>
        {change && (
          <span className={`text-[9px] font-semibold px-1 rounded ${
            change.startsWith("+") ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
          }`}>
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-[640px] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-sky-100/40 border border-gray-100/80 ring-1 ring-black/5"
    >
      {/* Mock Browser Header */}
      <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-3.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-[10px] font-medium tracking-wide text-gray-400 select-none">assetflow.app/dashboard</span>
      </div>

      <div className="bg-gradient-to-b from-white to-gray-50 p-5">
        <div className="flex flex-row gap-4">
          <div className="flex-1 space-y-4">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                title="Assets"
                value="1,248"
                change="+4%"
                icon={Boxes}
                iconBg="bg-sky-50"
                iconColor="text-sky-600"
              />
              <StatCard
                title="Allocations"
                value="342"
                change="+12"
                icon={UserCheck}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              />
              <StatCard
                title="Maint."
                value="27"
                change="-3"
                icon={Wrench}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />
            </div>

            {/* Asset Breakdown Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                    <Activity size={12} />
                  </span>
                  <span className="text-xs font-semibold text-gray-700">Asset Status Breakdown</span>
                </div>
                <div className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Last 30d</div>
              </div>

              <div className="mt-4 flex flex-row items-stretch gap-5">
                {/* Beautiful Mock Animated Chart */}
                <div className="h-28 flex items-end gap-4 rounded-xl bg-gray-50/50 p-4 border border-gray-100/50 flex-1">
                  <div className="flex flex-col items-center gap-1.5 flex-1 group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '72%' }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md relative transition-all duration-300 group-hover:brightness-105"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">72%</div>
                    </motion.div>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Avail</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 flex-1 group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '18%' }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-md relative transition-all duration-300 group-hover:brightness-105"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">18%</div>
                    </motion.div>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Used</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 flex-1 group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '10%' }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                      className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md relative transition-all duration-300 group-hover:brightness-105"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">10%</div>
                    </motion.div>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Maint</span>
                  </div>
                </div>

                <div className="w-32 shrink-0 flex flex-col justify-start gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Available
                    </span>
                    <span className="font-bold text-gray-900 ml-1">72%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                      In Use
                    </span>
                    <span className="font-bold text-gray-900 ml-1">18%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Maint.
                    </span>
                    <span className="font-bold text-gray-900 ml-1">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Mock Items */}
          <aside className="w-64 space-y-4">
            {/* Recent Activity Card */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-50 text-sky-600">
                    <List size={12} />
                  </span>
                  <span className="text-xs font-semibold text-gray-700">Recent Activity</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
              </div>
              <ul className="mt-3 space-y-2.5 text-[11px] text-gray-600">
                <motion.li
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50/50 transition-colors"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckSquare size={10} />
                  </span>
                  <span className="truncate">Asset A moved to <strong className="text-gray-700 font-semibold">Sales</strong></span>
                </motion.li>
                <motion.li
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50/50 transition-colors"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <Wrench size={10} />
                  </span>
                  <span className="truncate">Maintenance for <strong className="text-gray-700 font-semibold">Asset D</strong></span>
                </motion.li>
              </ul>
            </div>

            {/* Active Allocations Card */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                  <UserCheck size={12} />
                </span>
                <span className="text-xs font-semibold text-gray-700">Active Allocations</span>
              </div>
              <div className="mt-3 space-y-2.5 text-[11px]">
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="text-gray-600 truncate">Laptop — Finance</span>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">2d</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    <span className="text-gray-600 truncate">Projector — Sales</span>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">7d</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
