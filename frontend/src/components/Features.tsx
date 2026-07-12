import {
  Package, Repeat, Wrench, Calendar, BarChart2, Bell
} from "lucide-react";

const FEATURES = [
  {
    title: "Asset Registration",
    desc: "Register and organize organizational assets with categories and unique asset IDs.",
    icon: Package,
  },
  {
    title: "Asset Allocation & Transfer",
    desc: "Prevent double allocation while maintaining complete allocation history.",
    icon: Repeat,
  },
  {
    title: "Maintenance Management",
    desc: "Track maintenance requests, approvals, and asset lifecycle.",
    icon: Wrench,
  },
  {
    title: "Resource Booking",
    desc: "Book shared organizational resources with conflict detection.",
    icon: Calendar,
  },
  {
    title: "Analytics Dashboard",
    desc: "Visualize asset utilization, maintenance trends, and department statistics.",
    icon: BarChart2,
  },
  {
    title: "Notifications",
    desc: "Receive real-time alerts for transfers, approvals, maintenance, and returns.",
    icon: Bell,
  },
];

function FeatureCard({ title, desc, Icon }: any) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-sky-50 p-3 text-sky-600">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <div id="features">
      <h2 className="text-lg font-semibold text-gray-900">Trusted Features</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Enterprise-focused capabilities to manage your organization's assets reliably.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} title={f.title} desc={f.desc} Icon={f.icon} />
        ))}
      </div>
    </div>
  );
}
