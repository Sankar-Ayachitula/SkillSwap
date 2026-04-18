/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { api } from "../utils/api.js";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await api.get("/api/users/me");
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email, password) => {
    const data = await api.post("/api/users/login", { email, password });
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.post("/api/users/register", {
      name,
      email,
      password,
    });
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/api/users/logout");
    } catch {
      /* ignore */
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const data = await api.put("/api/users/me", updates);
    setUser(data);
    return data;
  };

  const deleteAccount = async () => {
    await api.delete("/api/users/me");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
