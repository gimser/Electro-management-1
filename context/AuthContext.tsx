
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole } from '../types';

interface AuthContextType {
  user: AppUser | null;
  role: UserRole | null;
  login: (userData: AppUser) => void;
  logout: () => void;
  updateUser: (userData: AppUser) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('gim_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = (userData: AppUser) => {
    setIsLoading(true);
    try {
      setUser(userData);
      localStorage.setItem('gim_user', JSON.stringify(userData));
      localStorage.setItem('gim_session', 'true');
      setError(null);
    } catch (e) {
      setError("فشل حفظ بيانات الجلسة محلياً");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: AppUser) => {
    try {
      setUser(userData);
      localStorage.setItem('gim_user', JSON.stringify(userData));
    } catch (e) {
      console.error("Failed to update user in localStorage", e);
    }
  };

  const logout = () => {
    setIsLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('gim_user');
      localStorage.removeItem('gim_session');
      setError(null);
    } catch (e) {
      setError("فشل تسجيل الخروج بشكل كامل");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || null, 
      login, 
      logout,
      updateUser,
      isAuthenticated: !!user,
      isLoading,
      error,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
