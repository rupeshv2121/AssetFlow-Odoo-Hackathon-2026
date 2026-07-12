import { BookOpen, Wrench, ClipboardList } from "lucide-react";

const TIPS = [
  {
    icon: BookOpen,
    title: "Set up your organization first",
    desc: "Departments, asset categories, and the employee directory are the master data everything else depends on.",
  },
  {
    icon: Wrench,
    title: "Route repairs through approval",
    desc: "Maintenance requests flip an asset to Under Maintenance only after an Asset Manager approves the work.",
  },
  {
    icon: ClipboardList,
    title: "Run audits on a schedule",
    desc: "Assign auditors, mark assets Verified / Missing / Damaged, and let discrepancy reports write themselves.",
  },
];

export default function Resources() {
  return (
    <div id="resources">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Getting started</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">
          A few things worth knowing before you dive in.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {TIPS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-500 hover:shadow-xl"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500 text-white transition-transform duration-300 group-hover:scale-110">
              <Icon size={18} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-sky-600">
              {title}
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
