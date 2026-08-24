import { createContext, useContext, useEffect, useState } from "react";
import { registerUser, loginUser } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("optim_token"));

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("optim_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("optim_token", token);
    else localStorage.removeItem("optim_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("optim_user", JSON.stringify(user));
    else localStorage.removeItem("optim_user");
  }, [user]);

  const applySession = (session) => {
    setToken(session.token);
    setUser(session.user);
  };

  const register = async (fields) => applySession(await registerUser(fields));

  const login = async (fields) => applySession(await loginUser(fields));

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);