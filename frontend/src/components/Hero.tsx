import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import DashboardPreview from "@/components/DashboardPreview";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-0 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
            <Sparkles size={14} />
            Built for the Odoo Hackathon
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
            A system for managing every asset your organization{" "}
            <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-sky-700">needs</span>
          </h1>

          <p className="mt-5 text-base text-gray-600">
            Track, allocate, book, and maintain equipment, vehicles, and shared spaces —
            with conflict-free scheduling and full audit trails, all in one place.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 hover:from-sky-700 hover:to-indigo-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-4 text-xs font-medium text-gray-400">
            Role-based access built in &middot; Set up your organization in minutes
          </p>
        </div>

        <div className="relative order-first md:order-last">
          <div className="pointer-events-none absolute -left-6 -top-6 z-10 hidden rounded-xl bg-white p-3 shadow-lg ring-1 ring-black/5 sm:block">
            <div className="text-xs text-gray-400">Available</div>
            <div className="mt-1 text-xl font-bold text-emerald-600">72%</div>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-4 z-10 hidden rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-black/5 sm:block">
            <div className="text-xs text-gray-400">Bookings this week</div>
            <div className="mt-1 text-xl font-bold text-sky-600">64</div>
          </div>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
