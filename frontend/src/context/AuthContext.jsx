import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  const register = async (formData) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const login = async (formData) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const updateProfile = async (formData) => {
    const data = await apiRequest("/auth/me", {
      method: "PUT",
      body: JSON.stringify(formData),
    });

    const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

    const updatedUser = {
      ...existingUser,
      ...data,
      token: existingUser.token,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    return updatedUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const getCurrentUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest("/auth/me");
      const mergedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        ...data,
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));
      setUser(mergedUser);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}