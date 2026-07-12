import { Building2, Lock, Layers, ShieldCheck, FileSearch, Activity } from "lucide-react";

const ITEMS = [
  {
    title: "Enterprise Ready",
    desc: "Clean module boundaries, no coupling to purchasing or accounting.",
    icon: Building2,
    color: "bg-sky-50 text-sky-600",
  },
  {
    title: "Role Based Access",
    desc: "Fine-grained permissions for admins, managers, heads, and employees.",
    icon: Lock,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Scalable Architecture",
    desc: "Modular design that grows from one department to many.",
    icon: Layers,
    color: "bg-violet-50 text-violet-600",
  },
  {
    title: "Secure by Default",
    desc: "No self-assigned admin roles — access is always granted deliberately.",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Audit Friendly",
    desc: "Structured audit cycles with auto-generated discrepancy reports.",
    icon: FileSearch,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Real-Time Visibility",
    desc: "Overdue returns, bookings, and maintenance surfaced instantly.",
    icon: Activity,
    color: "bg-rose-50 text-rose-600",
  },
];

export default function WhyAssetFlow() {
  return (
    <div id="about">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Why AssetFlow
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">
          Built for organizations that need reliable asset operations.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {ITEMS.map(({ title, desc, icon: Icon, color }) => (
          <div
            key={title}
            className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-500 hover:shadow-xl"
          >
            <div
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color} transition-transform duration-300 group-hover:scale-110`}
            >
              <Icon size={18} />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-gray-900">
              {title}
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
