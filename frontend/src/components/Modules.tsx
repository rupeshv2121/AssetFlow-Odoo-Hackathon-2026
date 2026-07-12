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
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-sky-50 p-2 text-sky-600">
          <Icon size={18} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function Modules() {
  return (
    <div id="modules">
      <h2 className="text-lg font-semibold text-gray-900">Modules</h2>
      <p className="mt-2 text-sm text-gray-600">Core modules for enterprise asset management.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <ModuleCard key={m.title} title={m.title} desc={m.desc} Icon={m.icon} />
        ))}
      </div>
    </div>
  );
}
