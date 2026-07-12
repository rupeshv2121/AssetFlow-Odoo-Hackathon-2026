import { apiClient } from "@/services/apiClient";
import { AllocationRequestItem } from "@/types/allocation";

export async function listAllocationRequests(): Promise<AllocationRequestItem[]> {
  const { data } = await apiClient.get<{ allocationRequests: AllocationRequestItem[] }>("/allocation-requests");
  return data.allocationRequests;
}

export interface CreateAllocationRequestInput {
  assetId: string;
  toEmployeeId?: string;
  toDepartmentId?: string;
}

export async function createAllocationRequest(
  input: CreateAllocationRequestInput
): Promise<AllocationRequestItem> {
  const { data } = await apiClient.post<{ allocationRequest: AllocationRequestItem }>(
    "/allocation-requests",
    input
  );
  return data.allocationRequest;
}

export async function approveAllocationRequest(id: string): Promise<AllocationRequestItem> {
  const { data } = await apiClient.patch<{ allocationRequest: AllocationRequestItem }>(
    `/allocation-requests/${id}/approve`
  );
  return data.allocationRequest;
}

export async function rejectAllocationRequest(id: string): Promise<AllocationRequestItem> {
  const { data } = await apiClient.patch<{ allocationRequest: AllocationRequestItem }>(
    `/allocation-requests/${id}/reject`
  );
  return data.allocationRequest;
}
