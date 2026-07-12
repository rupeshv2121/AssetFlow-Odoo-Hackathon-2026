import { useEffect, useState } from "react";
import * as employeeService from "@/services/employeeService";
import { Employee } from "@/types/orgSetup";
import { Role } from "@/types/auth";

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  ASSET_MANAGER: "Asset Manager",
  DEPARTMENT_HEAD: "Department Head",
  EMPLOYEE: "Employee",
};

export default function DepartmentEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    employeeService
      .listEmployees()
      .then(setEmployees)
      .catch((err) => setError(err?.response?.data?.message || "Failed to load employees"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Department Employees</h1>
      <p className="mt-1 text-sm text-gray-500">
        Everyone currently assigned to the department(s) you head. Role and department changes are made by an Admin.
      </p>

      {isLoading && <p className="mt-4 text-sm text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!isLoading && !error && (
        <div className="mt-4 overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{emp.name}</td>
                  <td className="px-4 py-2 text-gray-600">{emp.email}</td>
                  <td className="px-4 py-2 text-gray-600">{emp.department?.name || "—"}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {roleLabel[emp.role]}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        emp.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No employees in your department yet.
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
