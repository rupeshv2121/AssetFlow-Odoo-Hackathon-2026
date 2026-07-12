import { Link } from "react-router-dom";
import {
  Boxes,
  Repeat2,
  Car,
  Armchair,
  Laptop,
  Wrench,
  ClipboardCheck,
  Bell,
  Mail,
  BarChart2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function CardLink({ to }: { to: string }) {
  return (
    <Link to={to} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold hover:underline">
      Learn more <ArrowRight size={12} />
    </Link>
  );
}

export default function SolutionsGrid() {
  return (
    <div id="solutions">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Our modules make a difference!
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">
          Every screen your team needs to run asset operations end to end, with clean
          role-based workflows.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Asset Lifecycle */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 p-6 text-white shadow-lg">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Boxes size={20} />
          </div>
          <h3 className="mt-4 text-lg font-bold">Asset Lifecycle</h3>
          <p className="mt-1 text-sm text-sky-100">
            Register assets with auto-generated tags and track them through Available,
            Allocated, Reserved, Under Maintenance, Lost, Retired, and Disposed.
          </p>
          <div className="mt-5 flex gap-2">
            {[Laptop, Car, Armchair].map((Icon, i) => (
              <span
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"
              >
                <Icon size={14} />
              </span>
            ))}
          </div>
          <CardLink to="/signup" />
        </div>

        {/* Allocation & Transfers */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <Repeat2 size={20} />
          </div>
          <h3 className="mt-4 text-lg font-bold">Allocation &amp; Transfers</h3>
          <p className="mt-1 text-sm text-gray-300">
            One asset, one holder — ever. Conflicting requests are blocked automatically
            and routed into an approval-based transfer workflow instead.
          </p>
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <ShieldCheck size={12} /> Zero double-allocations
          </div>
          <CardLink to="/signup" />
        </div>

        {/* Resource Booking */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm ring-1 ring-orange-100">
          <h3 className="text-lg font-bold text-gray-900">Resource Booking</h3>
          <p className="mt-1 text-sm text-gray-600">
            Book rooms, vehicles, and shared equipment by time slot with automatic
            overlap detection.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Rooms", "bg-sky-100 text-sky-700"],
              ["Vehicles", "bg-violet-100 text-violet-700"],
              ["Equipment", "bg-emerald-100 text-emerald-700"],
              ["No Overlaps", "bg-orange-100 text-orange-700"],
              ["Calendar View", "bg-pink-100 text-pink-700"],
            ].map(([label, cls]) => (
              <span key={label} className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>
                {label}
              </span>
            ))}
          </div>
          <CardLink to="/signup" />
        </div>

        {/* Maintenance & Audits */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center gap-3 bg-emerald-50 px-6 py-4">
            <Wrench className="text-emerald-600" size={18} />
            <span className="text-sm font-semibold text-gray-900">Maintenance Workflow</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-4">
            <ClipboardCheck className="text-gray-500" size={18} />
            <span className="text-sm font-semibold text-gray-900">Audit Cycles</span>
          </div>
          <p className="px-6 pb-5 text-sm text-gray-600">
            Requests route through approval before repair work starts; scheduled audits
            auto-generate discrepancy reports for missing or damaged items.
          </p>
        </div>

        {/* Notifications & Reports */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-sm ring-1 ring-violet-100">
          <h3 className="text-lg font-bold text-gray-900">Notifications &amp; Reports</h3>
          <p className="mt-1 text-sm text-gray-600">
            Overdue returns, bookings, and maintenance surfaced the moment they happen.
          </p>
          <div className="relative mt-6 flex h-24 items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg">
              <Bell size={20} />
            </span>
            {[Mail, BarChart2, AlertCircle].map((Icon, i) => (
              <span
                key={i}
                className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-white text-violet-600 shadow-md"
                style={{
                  left: `${20 + i * 30}%`,
                  top: i === 1 ? "0%" : "70%",
                }}
              >
                <Icon size={14} />
              </span>
            ))}
          </div>
        </div>

        {/* Roles */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Built for every role</h3>
          <p className="mt-1 text-sm text-gray-600">
            No self-assigned admin roles — access is granted deliberately, from the top.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Admin", "bg-purple-100 text-purple-700"],
              ["Asset Manager", "bg-sky-100 text-sky-700"],
              ["Department Head", "bg-blue-100 text-blue-700"],
              ["Employee", "bg-emerald-100 text-emerald-700"],
            ].map(([label, cls]) => (
              <span key={label} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cls}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
