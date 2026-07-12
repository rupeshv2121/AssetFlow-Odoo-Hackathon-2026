import { apiClient } from "@/services/apiClient";
import { DashboardData } from "@/types/dashboard";

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>("/dashboard");
  return data;
}
