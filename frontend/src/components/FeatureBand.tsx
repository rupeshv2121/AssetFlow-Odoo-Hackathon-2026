import { TrendingUp, Users, BarChart3, CheckCircle2, RefreshCw } from "lucide-react";

function FloatingCard({
  children,
  rotate = "rotate-0",
}: {
  children: React.ReactNode;
  rotate?: string;
}) {
  return (
    <div className={`w-44 shrink-0 rounded-xl bg-white p-3 shadow-xl ${rotate}`}>{children}</div>
  );
}

export default function FeatureBand() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-20">
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Smart asset management in one place!
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-200">
          Every allocation, booking, and maintenance event synced in real time — no
          spreadsheets, no guesswork.
        </p>

        <div className="mt-16 flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-10">
          <div className="flex gap-4 lg:flex-col">
            <FloatingCard rotate="-rotate-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Allocation Rate</span>
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
              <div className="mt-1 text-xl font-bold text-gray-900">82%</div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[10px] font-semibold text-sky-700">
                  PS
                </span>
                <span className="text-[11px] text-gray-500">up 6% this month</span>
              </div>
            </FloatingCard>

            <FloatingCard rotate="rotate-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users size={14} className="text-indigo-500" />
                <span>Team coverage</span>
              </div>
              <div className="mt-2 flex -space-x-2">
                {["PS", "RK", "AV", "+8"].map((initials) => (
                  <span
                    key={initials}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[10px] font-semibold text-indigo-700"
                  >
                    {initials}
                  </span>
                ))}
              </div>
            </FloatingCard>
          </div>

          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 shadow-2xl">
            <div className="absolute inset-0 animate-pulse rounded-full bg-white/10" />
            <RefreshCw className="text-white" size={28} />
          </div>

          <div className="flex gap-4 lg:flex-col">
            <FloatingCard rotate="rotate-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BarChart3 size={14} className="text-sky-500" />
                <span>Bookings this week</span>
              </div>
              <div className="mt-2 flex h-10 items-end gap-1">
                {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                  <span key={i} className="w-2 rounded-t bg-sky-400" style={{ height: `${h}%` }} />
                ))}
              </div>
            </FloatingCard>

            <FloatingCard rotate="-rotate-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Maintenance approved</span>
              </div>
              <div className="mt-1 text-[11px] text-gray-600">Ravi K. resolved AF-0032</div>
            </FloatingCard>
          </div>
        </div>
      </div>
    </section>
  );
}
