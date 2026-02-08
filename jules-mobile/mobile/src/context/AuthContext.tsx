import React, { createContext, useState, useContext } from 'react';
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

  const login = async () => {
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
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUser: User) => {
      setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
