import { apiClient } from "@/services/apiClient";
import { Employee } from "@/types/orgSetup";
import { Role } from "@/types/auth";

export async function listEmployees(): Promise<Employee[]> {
  const { data } = await apiClient.get<{ employees: Employee[] }>("/employees");
  return data.employees;
}

export async function updateEmployee(
  id: string,
  input: { departmentId?: string | null; status?: "ACTIVE" | "INACTIVE" }
): Promise<Employee> {
  const { data } = await apiClient.patch<{ employee: Employee }>(`/employees/${id}`, input);
  return data.employee;
}

export async function promoteEmployee(id: string, role: Role): Promise<Employee> {
  const { data } = await apiClient.post<{ employee: Employee }>(`/employees/${id}/promote`, { role });
  return data.employee;
}
