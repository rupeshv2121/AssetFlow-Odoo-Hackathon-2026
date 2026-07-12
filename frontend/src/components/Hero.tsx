import { Link } from "react-router-dom";
import DashboardPreview from "@/components/DashboardPreview";

export default function Hero() {
  return (
    <section className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2">
      <div className="max-w-xl">
        <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
          Enterprise Asset Management
          <br />
          <span className="text-sky-600">Made Simple.</span>
        </h1>

        <p className="mt-4 text-gray-600">
          Track, allocate, transfer, maintain, and audit organizational assets with
          a modern ERP solution built for efficiency and transparency.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/signup"
            className="rounded-md bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            Get Started
          </Link>

          <a
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            View Dashboard
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm text-gray-600">
          <div className="rounded-full bg-gray-100 px-3 py-2">Trusted by enterprises</div>
          <div className="rounded-full bg-gray-100 px-3 py-2">Role-based access</div>
          <div className="rounded-full bg-gray-100 px-3 py-2">Audit ready</div>
        </div>
      </div>

      <div className="order-first md:order-last">
        <DashboardPreview />
      </div>
    </section>
  );
}
