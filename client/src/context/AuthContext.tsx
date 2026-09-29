import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ role: Role }>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('mh_gov_token');
    const storedUser = localStorage.getItem('mh_gov_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('mh_gov_token');
        localStorage.removeItem('mh_gov_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ role: Role }> => {
    const response = await authApi.login({ email, password });
    const payload = response.data?.data || response.data;
    const newToken = payload.token;
    const newUser = payload.user;
    if (!newToken || !newUser) {
      throw new Error('Invalid authentication response from server');
    }
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('mh_gov_token', newToken);
    localStorage.setItem('mh_gov_user', JSON.stringify(newUser));
    return { role: newUser.role };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mh_gov_token');
    localStorage.removeItem('mh_gov_user');
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('mh_gov_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
