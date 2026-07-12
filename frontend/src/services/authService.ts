import { apiClient } from "@/services/apiClient";
import { AuthResponse, LoginInput, SignupInput, User } from "@/types/auth";

export async function signup(input: SignupInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", input);
  return data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", input);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function forgotPassword(email: string): Promise<{ message: string; devResetLink?: string }> {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const { data } = await apiClient.post("/auth/reset-password", { token, password });
  return data;
}
