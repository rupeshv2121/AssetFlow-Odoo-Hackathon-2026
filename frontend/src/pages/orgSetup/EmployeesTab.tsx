import { useState } from "react";
import * as employeeService from "@/services/employeeService";
import { Department, Employee } from "@/types/orgSetup";
import { Role } from "@/types/auth";

interface Props {
  employees: Employee[];
  departments: Department[];
  refetch: () => void;
}

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  ASSET_MANAGER: "Asset Manager",
  DEPARTMENT_HEAD: "Department Head",
  EMPLOYEE: "Employee",
};

export default function EmployeesTab({ employees, departments, refetch }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function withBusy(id: string, fn: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await fn();
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Employee Directory</h2>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((emp) => {
              const isBusy = busyId === emp.id;
              return (
                <tr key={emp.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{emp.name}</td>
                  <td className="px-4 py-2 text-gray-600">{emp.email}</td>
                  <td className="px-4 py-2">
                    <select
                      disabled={isBusy}
                      value={emp.departmentId || ""}
                      onChange={(e) =>
                        withBusy(emp.id, () =>
                          employeeService.updateEmployee(emp.id, { departmentId: e.target.value || null })
                        )
                      }
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="">— Unassigned —</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {roleLabel[emp.role]}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      disabled={isBusy}
                      onClick={() =>
                        withBusy(emp.id, () =>
                          employeeService.updateEmployee(emp.id, {
                            status: emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                          })
                        )
                      }
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        emp.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {emp.status}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    {emp.role === "ADMIN" ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : emp.role === "EMPLOYEE" ? (
                      <div className="flex gap-2">
                        <button
                          disabled={isBusy}
                          onClick={() => withBusy(emp.id, () => employeeService.promoteEmployee(emp.id, "DEPARTMENT_HEAD"))}
                          className="text-xs font-medium text-gray-600 hover:underline disabled:opacity-50"
                        >
                          → Dept Head
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => withBusy(emp.id, () => employeeService.promoteEmployee(emp.id, "ASSET_MANAGER"))}
                          className="text-xs font-medium text-gray-600 hover:underline disabled:opacity-50"
                        >
                          → Asset Manager
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={isBusy}
                        onClick={() => withBusy(emp.id, () => employeeService.promoteEmployee(emp.id, "EMPLOYEE"))}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        Demote to Employee
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No employees yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
