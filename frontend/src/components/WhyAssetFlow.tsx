export default function WhyAssetFlow() {
  const ITEMS = [
    "Enterprise Ready",
    "Role Based Access",
    "Scalable Architecture",
    "Secure Asset Tracking",
    "Audit Friendly",
    "Real-time Dashboard",
  ];

  return (
    <div id="about">
      <h2 className="text-lg font-semibold text-gray-900">Why AssetFlow</h2>
      <p className="mt-2 text-sm text-gray-600">Built for enterprises that need reliable asset operations.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {ITEMS.map((t) => (
          <div key={t} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-900">{t}</div>
            <div className="mt-2 text-sm text-gray-600">
              {t === "Real-time Dashboard" && "Live telemetry and audit trails for operations."}
              {t === "Audit Friendly" && "Detailed logs, immutable history, and exportable reports."}
              {t === "Secure Asset Tracking" && "Encryption, secure APIs and role-based policies."}
              {t === "Scalable Architecture" && "Cloud-native patterns to grow with your organization."}
              {t === "Role Based Access" && "Fine-grained permissions for teams and auditors."}
              {t === "Enterprise Ready" && "Compliance-minded features and integrations."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
