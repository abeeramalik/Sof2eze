import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { backend } from "../api/backendClient";

// FR22 / guardrail #3: the access token lives ONLY in this React state.
// It is never written to localStorage, sessionStorage, or any other
// persistent browser storage. A page refresh loses it on purpose;
// `bootstrapSession` below silently recovers it using the httpOnly refresh
// cookie instead, which JS can't read or steal.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const bootstrapSession = useCallback(async () => {
    try {
      const { accessToken: token, user: refreshedUser } = await backend.refresh();
      setAccessToken(token);
      setUser(refreshedUser);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  const login = useCallback(async (email, password) => {
    const { accessToken: token, user: loggedInUser } = await backend.login(email, password);
    setAccessToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await backend.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ accessToken, user, initializing, login, logout, isAuthenticated: Boolean(accessToken) }),
    [accessToken, user, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
