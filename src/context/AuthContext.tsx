import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isAxiosError } from "axios";
import { api, tokenStorage } from "@/lib/api";
import type { LoginPayload, RegisterPayload, TokenPair, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Extracts a human-readable message from a FastAPI error response. */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCurrentUser = useCallback(async () => {
    const { data } = await api.get<User>("/auth/me");
    setUser(data);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!tokenStorage.getAccessToken()) {
        setIsLoading(false);
        return;
      }
      try {
        await refreshCurrentUser();
      } catch {
        tokenStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [refreshCurrentUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await api.post<TokenPair>("/auth/login", payload);
    tokenStorage.setTokens(data.access_token, data.refresh_token);
    const { data: me } = await api.get<User>("/auth/me");
    setUser(me);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.post<User>("/auth/register", payload);
    // Registration doesn't log the user in automatically — the backend
    // only returns the created profile, not tokens — so we chain a login.
    const { data } = await api.post<TokenPair>("/auth/login", {
      email: payload.email,
      password: payload.password,
    });
    tokenStorage.setTokens(data.access_token, data.refresh_token);
    const { data: me } = await api.get<User>("/auth/me");
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refreshCurrentUser,
    }),
    [user, isLoading, login, register, logout, refreshCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
