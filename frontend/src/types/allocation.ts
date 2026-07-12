export type AllocationStatus = "ACTIVE" | "RETURN_REQUESTED" | "RETURNED";
export type AllocationRequestType = "ALLOCATION" | "TRANSFER";
export type AllocationRequestStatus = "REQUESTED" | "APPROVED" | "REJECTED";

export interface Allocation {
  id: string;
  assetId: string;
  employeeId: string | null;
  departmentId: string | null;
  allocatedAt: string;
  expectedReturnDate: string | null;
  returnRequestedAt: string | null;
  returnedAt: string | null;
  returnCondition: string | null;
  status: AllocationStatus;
  createdAt: string;
  asset: { id: string; assetTag: string; name: string; status: string };
  employee: { id: string; name: string; email: string } | null;
  department: { id: string; name: string } | null;
}

export interface AllocationRequestItem {
  id: string;
  assetId: string;
  type: AllocationRequestType;
  requestedById: string;
  status: AllocationRequestStatus;
  createdAt: string;
  resolvedAt: string | null;
  asset: { id: string; assetTag: string; name: string; status: string };
  requestedBy: { id: string; name: string };
  fromEmployee: { id: string; name: string } | null;
  fromDepartment: { id: string; name: string } | null;
  toEmployee: { id: string; name: string } | null;
  toDepartment: { id: string; name: string } | null;
}
