import { apiClient } from "@/services/apiClient";
import { Allocation } from "@/types/allocation";

export async function listAllocations(): Promise<Allocation[]> {
  const { data } = await apiClient.get<{ allocations: Allocation[] }>("/allocations");
  return data.allocations;
}

export interface CreateAllocationInput {
  assetId: string;
  employeeId?: string;
  departmentId?: string;
  expectedReturnDate?: string;
}

export async function createAllocation(input: CreateAllocationInput): Promise<Allocation> {
  const { data } = await apiClient.post<{ allocation: Allocation }>("/allocations", input);
  return data.allocation;
}

export async function requestReturn(id: string): Promise<Allocation> {
  const { data } = await apiClient.post<{ allocation: Allocation }>(`/allocations/${id}/request-return`);
  return data.allocation;
}

export async function markReturned(id: string, returnCondition?: string): Promise<Allocation> {
  const { data } = await apiClient.patch<{ allocation: Allocation }>(`/allocations/${id}/return`, {
    returnCondition,
  });
  return data.allocation;
}
