import { apiClient } from "@/services/apiClient";
import { Department } from "@/types/orgSetup";

export async function listDepartments(): Promise<Department[]> {
  const { data } = await apiClient.get<{ departments: Department[] }>("/departments");
  return data.departments;
}

export async function createDepartment(input: {
  name: string;
  headId?: string;
  parentId?: string;
}): Promise<Department> {
  const { data } = await apiClient.post<{ department: Department }>("/departments", input);
  return data.department;
}

export async function updateDepartment(
  id: string,
  input: { name?: string; headId?: string | null; parentId?: string | null; status?: "ACTIVE" | "INACTIVE" }
): Promise<Department> {
  const { data } = await apiClient.patch<{ department: Department }>(`/departments/${id}`, input);
  return data.department;
}

export async function deactivateDepartment(id: string): Promise<Department> {
  const { data } = await apiClient.delete<{ department: Department }>(`/departments/${id}`);
  return data.department;
}
