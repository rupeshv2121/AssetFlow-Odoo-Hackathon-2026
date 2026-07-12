import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import * as maintenanceService from "@/services/maintenanceService";
import * as assetService from "@/services/assetService";
import { useAuth } from "@/context/AuthContext";
import { MaintenanceRequestItem, MaintenancePriority } from "@/types/maintenance";
import { Asset } from "@/types/asset";

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-sky-100 text-sky-700",
  REJECTED: "bg-red-100 text-red-700",
  TECHNICIAN_ASSIGNED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

const priorityColor: Record<MaintenancePriority, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-sky-100 text-sky-700",
  HIGH: "bg-amber-100 text-amber-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const emptyForm = { assetId: "", issueDescription: "", priority: "MEDIUM" as MaintenancePriority };

export default function MaintenanceManagement() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";
  const [searchParams] = useSearchParams();
  const preselectAssetId = searchParams.get("assetId");

  const [requests, setRequests] = useState<MaintenanceRequestItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(Boolean(preselectAssetId));
  const [form, setForm] = useState(() =>
    preselectAssetId ? { ...emptyForm, assetId: preselectAssetId } : emptyForm
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Non-managers can only raise a request for something currently allocated to
  // them (or their department) — not every bookable resource in the org, which
  // the asset list also includes so Book Resources / Asset Directory can show
  // them. A deep-linked preselected asset (from its detail page) is always kept
  // so the dropdown still reflects what was actually chosen.
  const assetOptions = canManage
    ? assets
    : assets.filter((a) => a.allocations.length > 0 || a.id === form.assetId);

  const load = useCallback(async () => {
    try {
      const [reqs, assetList] = await Promise.all([
        maintenanceService.listMaintenanceRequests(),
        assetService.listAssets(),
      ]);
      setRequests(reqs);
      setAssets(assetList);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load maintenance requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await maintenanceService.createMaintenanceRequest({
        assetId: form.assetId,
        issueDescription: form.issueDescription,
        priority: form.priority,
      });
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to raise request");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function runAction(id: string, fn: () => Promise<unknown>) {
    setActionError(null);
    setBusyId(id);
    try {
      await fn();
      load();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Maintenance Management</h1>
          <p className="text-sm text-gray-500">Route repairs through approval before work starts.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          {showForm ? "Cancel" : "Raise Request"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Asset</label>
            <select
              required
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select an asset...</option>
              {assetOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Describe the issue</label>
            <textarea
              required
              minLength={3}
              value={form.issueDescription}
              onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Screen flickers intermittently, won't hold charge..."
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as MaintenancePriority })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {formError && <p className="col-span-2 text-sm text-red-600">{formError}</p>}

          <div className="col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      {!isLoading && !error && (
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Asset</th>
                <th className="px-4 py-2">Issue</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Raised By</th>
                <th className="px-4 py-2">Technician</th>
                <th className="px-4 py-2">Status</th>
                {canManage && <th className="px-4 py-2"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => {
                const isBusy = busyId === r.id;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-2">
                      <Link to={`/assets/${r.asset.id}`} className="font-medium text-gray-900 hover:underline">
                        {r.asset.assetTag} — {r.asset.name}
                      </Link>
                    </td>
                    <td className="max-w-xs px-4 py-2 text-gray-600">{r.issueDescription}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[r.priority]}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{r.raisedBy.name}</td>
                    <td className="px-4 py-2 text-gray-600">{r.technicianName || "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-2 text-right">
                        {r.status === "PENDING" && (
                          <>
                            <button
                              disabled={isBusy}
                              onClick={() => runAction(r.id, () => maintenanceService.approveMaintenanceRequest(r.id))}
                              className="mr-3 text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={isBusy}
                              onClick={() => runAction(r.id, () => maintenanceService.rejectMaintenanceRequest(r.id))}
                              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {r.status === "APPROVED" && (
                          <button
                            disabled={isBusy}
                            onClick={() => {
                              const name = window.prompt("Technician name:");
                              if (name) runAction(r.id, () => maintenanceService.assignTechnician(r.id, name));
                            }}
                            className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-50"
                          >
                            Assign Technician
                          </button>
                        )}
                        {r.status === "TECHNICIAN_ASSIGNED" && (
                          <button
                            disabled={isBusy}
                            onClick={() => runAction(r.id, () => maintenanceService.startMaintenanceWork(r.id))}
                            className="text-xs font-medium text-violet-600 hover:underline disabled:opacity-50"
                          >
                            Start Work
                          </button>
                        )}
                        {r.status === "IN_PROGRESS" && (
                          <button
                            disabled={isBusy}
                            onClick={() => runAction(r.id, () => maintenanceService.resolveMaintenanceRequest(r.id))}
                            className="text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-4 py-6 text-center text-gray-400">
                    No maintenance requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
