export type Role = "ADMIN" | "ASSET_MANAGER" | "DEPARTMENT_HEAD" | "EMPLOYEE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}
