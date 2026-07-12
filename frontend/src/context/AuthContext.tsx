import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as authService from "@/services/authService";
import { TOKEN_STORAGE_KEY } from "@/services/apiClient";
import { User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_STORAGE_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await authService.login({ email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setUser(user);
  }

  async function signup(name: string, email: string, password: string) {
    const { token, user } = await authService.signup({ name, email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
