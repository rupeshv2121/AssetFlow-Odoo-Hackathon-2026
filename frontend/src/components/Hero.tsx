import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckSquare, BarChart } from "lucide-react";
import DashboardPreview from "@/components/DashboardPreview";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-0 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
            A system for managing every asset your organization{" "}
            <span className="text-sky-700">needs</span>
          </h1>

          <p className="mt-5 text-base text-gray-600">
            Track, allocate, book, and maintain equipment, vehicles, and shared spaces —
            with conflict-free scheduling and full audit trails, all in one place.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="rounded-full bg-sky-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-800"
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

        <div className="relative order-first md:order-last w-full h-[220px] xs:h-[260px] sm:h-[340px] md:h-[320px] lg:h-[420px] select-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.7] lg:scale-100 origin-center transition-all duration-300">
            {/* Floating Badge: Available */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="pointer-events-none absolute -left-8 -top-8 z-10 rounded-2xl bg-white/90 backdrop-blur-md p-3.5 shadow-xl shadow-sky-100/60 border border-sky-100/40 ring-1 ring-black/5 flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckSquare size={16} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available</div>
                <div className="text-lg font-extrabold text-emerald-600 leading-none mt-0.5">72%</div>
              </div>
            </motion.div>

            {/* Floating Badge: Bookings */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
              className="pointer-events-none absolute -bottom-8 -right-6 z-10 rounded-2xl bg-white/90 backdrop-blur-md p-3.5 shadow-xl shadow-sky-100/60 border border-sky-100/40 ring-1 ring-black/5 flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <BarChart size={16} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bookings this week</div>
                <div className="text-lg font-extrabold text-sky-600 leading-none mt-0.5">64</div>
              </div>
            </motion.div>

            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
