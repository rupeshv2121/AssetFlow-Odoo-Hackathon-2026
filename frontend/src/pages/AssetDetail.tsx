import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as assetService from "@/services/assetService";
import { useAuth } from "@/context/AuthContext";
import { AssetDetail as AssetDetailType } from "@/types/asset";

const MANUAL_STATUSES = ["AVAILABLE", "LOST", "RETIRED", "DISPOSED"] as const;

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";

  const [asset, setAsset] = useState<AssetDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      setAsset(await assetService.getAsset(id));
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load asset");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(status: (typeof MANUAL_STATUSES)[number]) {
    if (!id) return;
    setStatusError(null);
    setIsChangingStatus(true);
    try {
      await assetService.updateAssetStatus(id, status);
      await load();
    } catch (err: any) {
      setStatusError(err?.response?.data?.message || "Failed to change status");
    } finally {
      setIsChangingStatus(false);
    }
  }

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!asset) return null;

  return (
    <div>
      <Link to="/assets" className="mb-4 inline-block text-sm text-gray-500 hover:underline">
        &larr; Back to Asset Directory
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{asset.name}</h1>
          <p className="font-mono text-sm text-gray-500">{asset.assetTag}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">{asset.status}</span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 rounded-md border border-gray-200 p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-gray-500">Category</p>
          <p className="font-medium text-gray-900">{asset.category.name}</p>
        </div>
        <div>
          <p className="text-gray-500">Serial Number</p>
          <p className="font-medium text-gray-900">{asset.serialNumber || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Location</p>
          <p className="font-medium text-gray-900">{asset.location || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Condition</p>
          <p className="font-medium text-gray-900">{asset.condition || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Acquisition Cost</p>
          <p className="font-medium text-gray-900">{asset.acquisitionCost || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Bookable</p>
          <p className="font-medium text-gray-900">{asset.isBookable ? "Yes" : "No"}</p>
        </div>
      </div>

      {canManage && (
        <div className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Manual status correction</p>
          <div className="flex flex-wrap gap-2">
            {MANUAL_STATUSES.filter((s) => s !== asset.status).map((s) => (
              <button
                key={s}
                disabled={isChangingStatus}
                onClick={() => handleStatusChange(s)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Mark {s}
              </button>
            ))}
          </div>
          {statusError && <p className="mt-2 text-sm text-red-600">{statusError}</p>}
          <p className="mt-2 text-xs text-gray-400">
            Allocated / Reserved / Under Maintenance are set automatically by the Allocation, Booking, and
            Maintenance workflows — not editable here.
          </p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Allocation History</h2>
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Holder</th>
                <th className="px-4 py-2">Allocated</th>
                <th className="px-4 py-2">Expected Return</th>
                <th className="px-4 py-2">Returned</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {asset.allocations.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 text-gray-900">{a.employee?.name || a.department?.name || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{new Date(a.allocatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {a.returnedAt ? new Date(a.returnedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{a.status}</td>
                </tr>
              ))}
              {asset.allocations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                    No allocation history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Maintenance History</h2>
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Issue</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Raised By</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {asset.maintenanceRequests.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 text-gray-900">{m.issueDescription}</td>
                  <td className="px-4 py-2 text-gray-600">{m.priority}</td>
                  <td className="px-4 py-2 text-gray-600">{m.raisedBy.name}</td>
                  <td className="px-4 py-2 text-gray-600">{m.status}</td>
                </tr>
              ))}
              {asset.maintenanceRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                    No maintenance history yet.
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
