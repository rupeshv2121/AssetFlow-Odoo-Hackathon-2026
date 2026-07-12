import { UserPlus, Box, Repeat2, Zap, Calendar, Wrench, FileText, Bell } from "lucide-react";

const MODULES = [
  { title: "Organization Setup", desc: "Configure org units and departments", icon: UserPlus },
  { title: "Assets", desc: "Catalog and classify assets", icon: Box },
  { title: "Allocation", desc: "Assign assets to users and teams", icon: Repeat2 },
  { title: "Transfer", desc: "Track transfers between sites", icon: Zap },
  { title: "Resource Booking", desc: "Reserve shared resources", icon: Calendar },
  { title: "Maintenance", desc: "Manage maintenance workflows", icon: Wrench },
  { title: "Audit", desc: "Prepare and run audits", icon: FileText },
  { title: "Reports", desc: "Customizable reporting engine", icon: FileText },
  { title: "Notifications", desc: "Real-time alerts and inbox", icon: Bell },
];

function ModuleCard({ title, desc, Icon }: any) {
  return (
    <div className="rounded-xl bg-slate-50 p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white p-3 text-sky-600 shadow-sm">
          <Icon size={20} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function Modules() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Our modules make a difference!
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-200">
          Every screen your team needs to run asset operations end to end, with clean
          role-based workflows.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 px-6">
        {MODULES.map((m) => (
          <ModuleCard key={m.title} title={m.title} desc={m.desc} Icon={m.icon} />
        ))}
      </div>
    </section>
  );
}
