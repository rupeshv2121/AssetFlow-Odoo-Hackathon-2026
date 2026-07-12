import { apiClient } from "@/services/apiClient";
import { ReportsData } from "@/types/reports";

export async function getReports(): Promise<ReportsData> {
  const { data } = await apiClient.get<ReportsData>("/reports");
  return data;
}
