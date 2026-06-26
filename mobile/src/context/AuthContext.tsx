import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, setAuthToken, User } from "../services/api";
import { TOKEN_KEY, tokenStorage } from "../utils/tokenStorage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const me = await api.me();
    setUser(me);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStorage.getItem(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          await refreshUser();
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { token, user: loggedIn } = await api.login(email, password);
    await tokenStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(loggedIn);
  };

  const logout = async () => {
    await tokenStorage.deleteItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
