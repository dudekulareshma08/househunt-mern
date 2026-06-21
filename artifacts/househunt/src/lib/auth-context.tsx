import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "owner" | "renter";
  isApproved: boolean;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (data: { token: string; user: AuthUser }) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("hh_token");
    const storedUser = localStorage.getItem("hh_user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("hh_token");
        localStorage.removeItem("hh_user");
      }
    }
    setIsLoading(false);
  }, []);

  function login(data: { token: string; user: AuthUser }) {
    localStorage.setItem("hh_token", data.token);
    localStorage.setItem("hh_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("hh_token");
    localStorage.removeItem("hh_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
