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
      <h2 className="text-lg font-semibold text-gray-900">Why AssetFlow</h2>
      <p className="mt-2 text-sm text-gray-600">Built for organizations that need reliable asset operations.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {ITEMS.map(({ title, desc, icon: Icon, color }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              <Icon size={18} />
            </div>
            <div className="mt-3 text-sm font-semibold text-gray-900">{title}</div>
            <div className="mt-1 text-sm text-gray-600">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
