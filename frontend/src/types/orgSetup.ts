import { Role } from "@/types/auth";

export interface Department {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  parentId: string | null;
  createdAt: string;
  head: { id: string; name: string; email: string } | null;
  parent: { id: string; name: string } | null;
  _count: { employees: number };
}

export interface AssetCategory {
  id: string;
  name: string;
  extraFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
  departmentId: string | null;
  department: { id: string; name: string } | null;
  createdAt: string;
}
