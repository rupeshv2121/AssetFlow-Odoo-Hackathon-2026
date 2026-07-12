import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as allocationRequestService from "@/services/allocationRequestService";
import { useAuth } from "@/context/AuthContext";
import { AllocationRequestItem } from "@/types/allocation";

const statusColor: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

function targetLabel(r: AllocationRequestItem) {
  return r.toEmployee?.name || r.toDepartment?.name || "—";
}

function sourceLabel(r: AllocationRequestItem) {
  return r.fromEmployee?.name || r.fromDepartment?.name || "Available";
}

export default function AllocationRequests() {
  const { user } = useAuth();
  const canApprove = user?.role === "ADMIN" || user?.role === "ASSET_MANAGER" || user?.role === "DEPARTMENT_HEAD";

  const [requests, setRequests] = useState<AllocationRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(await allocationRequestService.listAllocationRequests());
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(id: string) {
    setActionError(null);
    setBusyId(id);
    try {
      await allocationRequestService.approveAllocationRequest(id);
      load();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Failed to approve request");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setActionError(null);
    setBusyId(id);
    try {
      await allocationRequestService.rejectAllocationRequest(id);
      load();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Failed to reject request");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">
        {canApprove ? "Transfer & Allocation Requests" : "My Requests"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Requested → Approved (by Asset Manager or Department Head) → Re-allocated.
      </p>

      {isLoading && <p className="mt-4 text-sm text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {actionError && <p className="mt-4 text-sm text-red-600">{actionError}</p>}

      {!isLoading && !error && (
        <div className="mt-4 overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Asset</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Requested By</th>
                <th className="px-4 py-2">Status</th>
                {canApprove && <th className="px-4 py-2"></th>}
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
                    <td className="px-4 py-2 text-gray-600">{r.type === "TRANSFER" ? "Transfer" : "Allocation"}</td>
                    <td className="px-4 py-2 text-gray-600">{sourceLabel(r)}</td>
                    <td className="px-4 py-2 text-gray-600">{targetLabel(r)}</td>
                    <td className="px-4 py-2 text-gray-600">{r.requestedBy.name}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    {canApprove && (
                      <td className="px-4 py-2">
                        {r.status === "REQUESTED" && (
                          <>
                            <button
                              disabled={isBusy}
                              onClick={() => handleApprove(r.id)}
                              className="mr-3 text-sm text-emerald-600 hover:underline disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={isBusy}
                              onClick={() => handleReject(r.id)}
                              className="text-sm text-red-600 hover:underline disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={canApprove ? 7 : 6} className="px-4 py-6 text-center text-gray-400">
                    No requests yet.
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
