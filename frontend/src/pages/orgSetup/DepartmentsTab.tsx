import { FormEvent, useState } from "react";
import * as departmentService from "@/services/departmentService";
import { Department, Employee } from "@/types/orgSetup";

interface Props {
  departments: Department[];
  employees: Employee[];
  refetch: () => void;
}

const emptyForm = { name: "", headId: "", parentId: "" };

export default function DepartmentsTab({ departments, employees, refetch }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eligibleHeads = employees.filter((e) => e.status === "ACTIVE" && e.role !== "ADMIN");

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setForm({ name: dept.name, headId: dept.head?.id || "", parentId: dept.parentId || "" });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        headId: form.headId || undefined,
        parentId: form.parentId || undefined,
      };
      if (editingId) {
        await departmentService.updateDepartment(editingId, {
          name: payload.name,
          headId: form.headId || null,
          parentId: form.parentId || null,
        });
      } else {
        await departmentService.createDepartment(payload);
      }
      setShowForm(false);
      refetch();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save department");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    if (!window.confirm("Deactivate this department?")) return;
    await departmentService.deactivateDepartment(id);
    refetch();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Departments</h2>
        <button
          onClick={startCreate}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add Department
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Department Head</label>
            <select
              value={form.headId}
              onChange={(e) => setForm({ ...form, headId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {eligibleHeads.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.email})
                </option>
              ))}
            </select>
            {eligibleHeads.length === 0 ? (
              <p className="mt-1 text-xs text-red-500">
                No active employees available to be assigned.
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Selecting an employee will automatically update their role to Department Head.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Parent Department</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">— None (top-level) —</option>
              {departments
                .filter((d) => d.id !== editingId)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingId ? "Save changes" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Head</th>
              <th className="px-4 py-2">Parent</th>
              <th className="px-4 py-2">Employees</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-2 font-medium text-gray-900">{d.name}</td>
                <td className="px-4 py-2 text-gray-600">{d.head?.name || "—"}</td>
                <td className="px-4 py-2 text-gray-600">{d.parent?.name || "—"}</td>
                <td className="px-4 py-2 text-gray-600">{d._count.employees}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => startEdit(d)} className="mr-3 text-sm text-gray-600 hover:underline">
                    Edit
                  </button>
                  {d.status === "ACTIVE" && (
                    <button
                      onClick={() => handleDeactivate(d.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No departments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
