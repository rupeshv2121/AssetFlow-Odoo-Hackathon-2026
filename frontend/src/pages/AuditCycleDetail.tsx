import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import * as auditCycleService from "@/services/auditCycleService";
import { useAuth } from "@/context/AuthContext";
import { AuditCycleDetail as AuditCycleDetailType, AuditResult } from "@/types/audit";

const resultColor: Record<string, string> = {
  VERIFIED: "bg-emerald-100 text-emerald-700",
  MISSING: "bg-red-100 text-red-700",
  DAMAGED: "bg-amber-100 text-amber-700",
};

export default function AuditCycleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [cycle, setCycle] = useState<AuditCycleDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setCycle(await auditCycleService.getAuditCycle(id));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load audit cycle");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isAuditor = cycle?.auditors.some((a) => a.auditor.id === user?.id) ?? false;
  const canMark = cycle?.status === "OPEN" && (isAuditor || user?.role === "ADMIN");
  const canClose = cycle?.status === "OPEN" && user?.role === "ADMIN";

  async function handleMark(itemId: string, result: AuditResult) {
    if (!id) return;
    setActionError(null);
    setBusyId(itemId);
    try {
      let notes: string | undefined;
      if (result !== "VERIFIED") {
        notes = window.prompt(`Notes for ${result.toLowerCase()} (optional):`) || undefined;
      }
      await auditCycleService.markAuditItem(id, itemId, result, notes);
      await load();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Failed to mark item");
    } finally {
      setBusyId(null);
    }
  }

  async function handleClose() {
    if (!id) return;
    if (!window.confirm("Close this audit cycle? Confirmed-missing assets will be marked Lost. This can't be undone.")) return;
    setActionError(null);
    setIsClosing(true);
    try {
      await auditCycleService.closeAuditCycle(id);
      await load();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Failed to close audit cycle");
    } finally {
      setIsClosing(false);
    }
  }

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!cycle) return null;

  const discrepancies = cycle.items.filter((i) => i.result === "MISSING" || i.result === "DAMAGED");
  const checkedCount = cycle.items.filter((i) => i.result).length;

  return (
    <div>
      <Link to="/audits" className="mb-4 inline-block text-sm text-gray-500 hover:underline">
        &larr; Back to Asset Audit
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{cycle.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {cycle.scopeDepartment?.name || cycle.scopeLocation || "All assets"} &middot;{" "}
            {new Date(cycle.startDate).toLocaleDateString()} – {new Date(cycle.endDate).toLocaleDateString()} &middot;{" "}
            Auditors: {cycle.auditors.map((a) => a.auditor.name).join(", ") || "none"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              cycle.status === "OPEN" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {cycle.status}
          </span>
          {canClose && (
            <button
              onClick={handleClose}
              disabled={isClosing}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isClosing ? "Closing..." : "Close Audit Cycle"}
            </button>
          )}
        </div>
      </div>

      {actionError && <p className="mb-4 text-sm text-red-600">{actionError}</p>}

      <p className="mb-2 text-sm text-gray-500">
        {checkedCount} of {cycle.items.length} assets checked
      </p>

      <div className="mb-6 overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Asset</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Result</th>
              <th className="px-4 py-2">Notes</th>
              {canMark && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cycle.items.map((item) => {
              const isBusy = busyId === item.id;
              return (
                <tr key={item.id}>
                  <td className="px-4 py-2">
                    <Link to={`/assets/${item.asset.id}`} className="font-medium text-gray-900 hover:underline">
                      {item.asset.assetTag} — {item.asset.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{item.asset.location || "—"}</td>
                  <td className="px-4 py-2">
                    {item.result ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${resultColor[item.result]}`}>
                        {item.result}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{item.notes || "—"}</td>
                  {canMark && (
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={isBusy}
                          onClick={() => handleMark(item.id, "VERIFIED")}
                          className="text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50"
                        >
                          Verified
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleMark(item.id, "MISSING")}
                          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          Missing
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleMark(item.id, "DAMAGED")}
                          className="text-xs font-medium text-amber-600 hover:underline disabled:opacity-50"
                        >
                          Damaged
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {cycle.items.length === 0 && (
              <tr>
                <td colSpan={canMark ? 5 : 4} className="px-4 py-6 text-center text-gray-400">
                  No assets in scope.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-900">Discrepancy Report</h2>
        </div>
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Asset</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2">Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {discrepancies.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {item.asset.assetTag} — {item.asset.name}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${resultColor[item.result!]}`}>
                      {item.result}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{item.notes || "—"}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {item.checkedAt ? new Date(item.checkedAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {discrepancies.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    No discrepancies flagged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
