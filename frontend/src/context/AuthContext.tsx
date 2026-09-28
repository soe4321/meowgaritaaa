import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginStudent: (identifier: string, pass: string) => Promise<void>;
  loginFaculty: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campus_od_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('campus_od_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          localStorage.setItem('campus_od_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [token]);

  const loginStudent = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authService.studentLogin(identifier, pass);
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('campus_od_token', data.accessToken);
      localStorage.setItem('campus_od_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const loginFaculty = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authService.facultyLogin(email, pass);
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('campus_od_token', data.accessToken);
      localStorage.setItem('campus_od_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campus_od_token');
    localStorage.removeItem('campus_od_user');
  };

  const refreshProfile = async () => {
    if (token) {
      const profile = await authService.getMe();
      setUser(profile);
      localStorage.setItem('campus_od_user', JSON.stringify(profile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        loginStudent,
        loginFaculty,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
