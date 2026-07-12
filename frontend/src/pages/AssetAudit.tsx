import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as auditCycleService from "@/services/auditCycleService";
import * as departmentService from "@/services/departmentService";
import * as employeeService from "@/services/employeeService";
import { useAuth } from "@/context/AuthContext";
import { AuditCycleSummary } from "@/types/audit";
import { Department, Employee } from "@/types/orgSetup";

const statusColor: Record<string, string> = {
  OPEN: "bg-sky-100 text-sky-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

const emptyForm = {
  name: "",
  scopeType: "none" as "none" | "department" | "location",
  scopeDepartmentId: "",
  scopeLocation: "",
  startDate: "",
  endDate: "",
  auditorIds: [] as string[],
};

export default function AssetAudit() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN";

  const [cycles, setCycles] = useState<AuditCycleSummary[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, d, e] = await Promise.all([
        auditCycleService.listAuditCycles(),
        canManage ? departmentService.listDepartments() : Promise.resolve([]),
        canManage ? employeeService.listEmployees() : Promise.resolve([]),
      ]);
      setCycles(c);
      setDepartments(d);
      setEmployees(e);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load audit cycles");
    } finally {
      setIsLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleAuditor(id: string) {
    setForm((f) => ({
      ...f,
      auditorIds: f.auditorIds.includes(id) ? f.auditorIds.filter((a) => a !== id) : [...f.auditorIds, id],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await auditCycleService.createAuditCycle({
        name: form.name,
        scopeDepartmentId: form.scopeType === "department" ? form.scopeDepartmentId : undefined,
        scopeLocation: form.scopeType === "location" ? form.scopeLocation : undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        auditorIds: form.auditorIds,
      });
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to create audit cycle");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Asset Audit</h1>
          <p className="text-sm text-gray-500">Structured verification cycles instead of a single form.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {showForm ? "Cancel" : "Create Audit Cycle"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Q3 Engineering Floor Audit"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Scope</label>
            <select
              value={form.scopeType}
              onChange={(e) => setForm({ ...form, scopeType: e.target.value as typeof form.scopeType })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="none">All assets</option>
              <option value="department">By department</option>
              <option value="location">By location</option>
            </select>
          </div>
          <div>
            {form.scopeType === "department" && (
              <>
                <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
                <select
                  required
                  value={form.scopeDepartmentId}
                  onChange={(e) => setForm({ ...form, scopeDepartmentId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </>
            )}
            {form.scopeType === "location" && (
              <>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                <input
                  required
                  value={form.scopeLocation}
                  onChange={(e) => setForm({ ...form, scopeLocation: e.target.value })}
                  placeholder="e.g. Floor 3, HQ Warehouse"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Auditors <span className="text-gray-400">(select one or more)</span>
            </label>
            <div className="flex flex-wrap gap-2 rounded-md border border-gray-200 bg-white p-2">
              {employees.map((emp) => (
                <button
                  type="button"
                  key={emp.id}
                  onClick={() => toggleAuditor(emp.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    form.auditorIds.includes(emp.id)
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {emp.name}
                </button>
              ))}
              {employees.length === 0 && <p className="text-xs text-gray-400">No employees available.</p>}
            </div>
          </div>

          {formError && <p className="col-span-2 text-sm text-red-600">{formError}</p>}

          <div className="col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Cycle"}
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
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Scope</th>
                <th className="px-4 py-2">Date Range</th>
                <th className="px-4 py-2">Auditors</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cycles.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {c.scopeDepartment?.name || c.scopeLocation || "All assets"}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{c.auditors.map((a) => a.auditor.name).join(", ")}</td>
                  <td className="px-4 py-2 text-gray-600">{c._count.items}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link to={`/audits/${c.id}`} className="text-sm text-gray-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {cycles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    No audit cycles yet.
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
