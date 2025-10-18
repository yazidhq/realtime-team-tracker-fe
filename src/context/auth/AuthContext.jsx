import { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("authToken") || null);

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      // If needed, fetch/verify user profile here using token
    }
  }, [token]);

  const handleRegister = async () => {
    return { ok: true };
  };

  const handleLogin = async (credentials) => {
    try {
      const fakeToken = "fake-token";
      const fakeUser = { id: 1, name: credentials?.username || "Anonymous" };

      setToken(fakeToken);
      setUser(fakeUser);
      localStorage.setItem("authToken", fakeToken);
      localStorage.setItem("authUser", JSON.stringify(fakeUser));

      return { ok: true, user: fakeUser };
    } catch (error) {
      return { ok: false, error };
    }
  };

  const handleLogout = async () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  return <AuthContext.Provider value={{ user, token, isAuthenticated, handleRegister, handleLogin, handleLogout }}>{children}</AuthContext.Provider>;
};
