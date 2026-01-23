
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole } from '../types';

interface AuthContextType {
  user: AppUser | null;
  role: UserRole | null;
  login: (userData: AppUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('gim_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: AppUser) => {
    setUser(userData);
    localStorage.setItem('gim_user', JSON.stringify(userData));
    localStorage.setItem('gim_session', 'true');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gim_user');
    localStorage.removeItem('gim_session');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || null, 
      login, 
      logout, 
      isAuthenticated: !!user 
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
