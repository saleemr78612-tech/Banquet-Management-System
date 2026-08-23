import { createContext, useContext, useState, type ReactNode } from "react";

// NOTE: This is a demo-only, frontend-only login gate for portfolio purposes.
// There is no backend, so this provides no real security — anyone with
// devtools access can bypass it. Do not use this pattern for real auth.

const AUTH_KEY = "bm_auth";
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "banquet123";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem(AUTH_KEY) === "1"
  );

  const login = (username: string, password: string): boolean => {
    const ok = username.trim().toLowerCase() === DEMO_USERNAME && password === DEMO_PASSWORD;
    if (ok) {
      localStorage.setItem(AUTH_KEY, "1");
      setIsAuthenticated(true);
    }
    return ok;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
