import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as allocationService from "@/services/allocationService";
import * as assetService from "@/services/assetService";
import * as employeeService from "@/services/employeeService";
import * as departmentService from "@/services/departmentService";
import { useAuth } from "@/context/AuthContext";
import { Allocation } from "@/types/allocation";
import { Asset } from "@/types/asset";
import { Employee, Department } from "@/types/orgSetup";

const statusColor: Record<string, string> = {
  ACTIVE: "bg-sky-100 text-sky-700",
  RETURN_REQUESTED: "bg-amber-100 text-amber-700",
  RETURNED: "bg-gray-100 text-gray-500",
};

function formatDate(dateInput: string | Date) {
  const date = new Date(dateInput);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const emptyForm = { assetId: "", targetType: "employee" as "employee" | "department", targetId: "", expectedReturnDate: "" };

export default function AssetAllocation() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";
  const [searchParams] = useSearchParams();
  const preselectAssetId = searchParams.get("assetId");

  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(Boolean(preselectAssetId));
  const [form, setForm] = useState(() =>
    preselectAssetId ? { ...emptyForm, assetId: preselectAssetId } : emptyForm
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [allocs, assets] = await Promise.all([
        allocationService.listAllocations(),
        canManage ? assetService.listAssets({ status: "AVAILABLE" }) : Promise.resolve([]),
      ]);
      setAllocations(allocs);
      setAvailableAssets(assets);
      if (canManage) {
        const [emps, depts] = await Promise.all([employeeService.listEmployees(), departmentService.listDepartments()]);
        setEmployees(emps);
        setDepartments(depts);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load allocations");
    } finally {
      setIsLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (form.expectedReturnDate) {
        const expected = new Date(form.expectedReturnDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expected.setHours(0, 0, 0, 0);
        if (expected < today) {
          setFormError("Expected return date cannot be before the allocated date");
          setIsSubmitting(false);
          return;
        }
      }
      await allocationService.createAllocation({
        assetId: form.assetId,
        employeeId: form.targetType === "employee" ? form.targetId : undefined,
        departmentId: form.targetType === "department" ? form.targetId : undefined,
        expectedReturnDate: form.expectedReturnDate || undefined,
      });
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to allocate asset");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestReturn(id: string) {
    setBusyId(id);
    try {
      await allocationService.requestReturn(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkReturned(id: string) {
    const returnCondition = window.prompt("Condition check-in notes (optional):") || undefined;
    setBusyId(id);
    try {
      await allocationService.markReturned(id, returnCondition);
      load();
    } finally {
      setBusyId(null);
    }
  }

  const eligibleTargets = form.targetType === "employee" ? employees : departments;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Asset Allocation</h1>
          <p className="text-sm text-gray-500">Who holds what, and for how long.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {showForm ? "Cancel" : "Allocate Asset"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Asset</label>
            <select
              required
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select an available asset...</option>
              {availableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expected Return Date</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.expectedReturnDate}
              onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Allocate To</label>
            <select
              value={form.targetType}
              onChange={(e) => setForm({ ...form, targetType: e.target.value as "employee" | "department", targetId: "" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="employee">Employee</option>
              <option value="department">Department</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {form.targetType === "employee" ? "Employee" : "Department"}
            </label>
            <select
              required
              value={form.targetId}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select...</option>
              {eligibleTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {formError && <p className="col-span-2 text-sm text-red-600">{formError}</p>}

          <div className="col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Allocating..." : "Allocate"}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && !error && (
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Asset</th>
                <th className="px-4 py-2">Held By</th>
                <th className="px-4 py-2">Allocated</th>
                <th className="px-4 py-2">Expected Return</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allocations.map((a) => {
                const isBusy = busyId === a.id;
                const isHolder = a.employeeId === user?.id;
                return (
                  <tr key={a.id}>
                    <td className="px-4 py-2">
                      <Link to={`/assets/${a.asset.id}`} className="font-medium text-gray-900 hover:underline">
                        {a.asset.assetTag} — {a.asset.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{a.employee?.name || a.department?.name || "—"}</td>
                    <td className="px-4 py-2 text-gray-600">{formatDate(a.allocatedAt)}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {a.expectedReturnDate ? formatDate(a.expectedReturnDate) : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[a.status]}`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {a.status === "ACTIVE" && (isHolder || canManage) && (
                        <button
                          disabled={isBusy}
                          onClick={() => handleRequestReturn(a.id)}
                          className="mr-3 text-sm text-gray-600 hover:underline disabled:opacity-50"
                        >
                          Request Return
                        </button>
                      )}
                      {(a.status === "ACTIVE" || a.status === "RETURN_REQUESTED") && canManage && (
                        <button
                          disabled={isBusy}
                          onClick={() => handleMarkReturned(a.id)}
                          className="text-sm text-emerald-600 hover:underline disabled:opacity-50"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {allocations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No allocations yet.
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
