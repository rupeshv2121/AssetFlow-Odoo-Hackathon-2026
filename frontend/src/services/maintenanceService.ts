import { apiClient } from "@/services/apiClient";
import { MaintenanceRequestItem, MaintenancePriority, MaintenanceStatus } from "@/types/maintenance";

export interface MaintenanceFilters {
  assetId?: string;
  status?: MaintenanceStatus;
}

export async function listMaintenanceRequests(
  filters: MaintenanceFilters = {}
): Promise<MaintenanceRequestItem[]> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const { data } = await apiClient.get<{ maintenanceRequests: MaintenanceRequestItem[] }>("/maintenance", {
    params,
  });
  return data.maintenanceRequests;
}

export interface CreateMaintenanceRequestInput {
  assetId: string;
  issueDescription: string;
  priority: MaintenancePriority;
  photoUrl?: string;
}

export async function createMaintenanceRequest(
  input: CreateMaintenanceRequestInput
): Promise<MaintenanceRequestItem> {
  const { data } = await apiClient.post<{ maintenanceRequest: MaintenanceRequestItem }>("/maintenance", input);
  return data.maintenanceRequest;
}

async function action(id: string, path: string, body?: Record<string, unknown>) {
  const { data } = await apiClient.patch<{ maintenanceRequest: MaintenanceRequestItem }>(
    `/maintenance/${id}/${path}`,
    body
  );
  return data.maintenanceRequest;
}

export const approveMaintenanceRequest = (id: string) => action(id, "approve");
export const rejectMaintenanceRequest = (id: string) => action(id, "reject");
export const assignTechnician = (id: string, technicianName: string) =>
  action(id, "assign-technician", { technicianName });
export const startMaintenanceWork = (id: string) => action(id, "start");
export const resolveMaintenanceRequest = (id: string) => action(id, "resolve");
