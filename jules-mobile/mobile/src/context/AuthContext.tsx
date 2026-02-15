import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { loginWithGitHub } from '../services/api';

export interface User {
  id: string;
  username: string;
  plan: 'free' | 'pro';
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async () => {
    try {
      // In a real app, this would redirect to a browser or use a library
      // Here we just call the mock endpoint
      const data = await loginWithGitHub();
      if (data && data.token) {
        setToken(data.token);
        setUser(data.user);
      } else {
        console.error("Login failed", data);
      }
    } catch (e) {
      console.error("Login exception", e);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((newUser: User) => {
      setUser(newUser);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    login,
    logout,
    updateUser
  }), [token, user, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
