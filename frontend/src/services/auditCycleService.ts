import { apiClient } from "@/services/apiClient";
import { AuditCycleSummary, AuditCycleDetail, AuditItemDetail, AuditResult } from "@/types/audit";

export async function listAuditCycles(): Promise<AuditCycleSummary[]> {
  const { data } = await apiClient.get<{ auditCycles: AuditCycleSummary[] }>("/audit-cycles");
  return data.auditCycles;
}

export async function getAuditCycle(id: string): Promise<AuditCycleDetail> {
  const { data } = await apiClient.get<{ auditCycle: AuditCycleDetail }>(`/audit-cycles/${id}`);
  return data.auditCycle;
}

export interface CreateAuditCycleInput {
  name: string;
  scopeDepartmentId?: string;
  scopeLocation?: string;
  startDate: string;
  endDate: string;
  auditorIds: string[];
}

export async function createAuditCycle(input: CreateAuditCycleInput): Promise<AuditCycleDetail> {
  const { data } = await apiClient.post<{ auditCycle: AuditCycleDetail }>("/audit-cycles", input);
  return data.auditCycle;
}

export async function markAuditItem(
  cycleId: string,
  itemId: string,
  result: AuditResult,
  notes?: string
): Promise<AuditItemDetail> {
  const { data } = await apiClient.patch<{ item: AuditItemDetail }>(`/audit-cycles/${cycleId}/items/${itemId}`, {
    result,
    notes,
  });
  return data.item;
}

export async function closeAuditCycle(id: string): Promise<AuditCycleDetail> {
  const { data } = await apiClient.patch<{ auditCycle: AuditCycleDetail }>(`/audit-cycles/${id}/close`);
  return data.auditCycle;
}
