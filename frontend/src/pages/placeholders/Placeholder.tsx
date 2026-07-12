import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Placeholder({ title }: { title?: string }) {
  const location = useLocation();

  useEffect(() => {
    document.title = title ? `${title} - AssetFlow` : `AssetFlow`;
  }, [title]);

  const display = title || location.pathname.replace(/\//g, " ").trim() || "Module";

  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">{display}</h1>
      <p className="mt-4 text-gray-600">Coming Soon...</p>
    </div>
  );
}
