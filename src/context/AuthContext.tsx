import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapRoleFromBackend = (roleInt: number | string): Role => {
  if (roleInt === 0 || roleInt === '0' || roleInt === 'ADMIN') return 'ADMIN';
  if (roleInt === 1 || roleInt === '1' || roleInt === 'DOCTOR') return 'DOCTOR';
  return 'STAFF';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('hms_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        parsedUser.role = mapRoleFromBackend(parsedUser.role);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing saved user", e);
        localStorage.removeItem('hms_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      // If no password is provided (e.g. from old mock tests), we default to our seed password
      const pwd = password || 'Password123!';
      
      const response = await api.post('/auth/login', { email, password: pwd });
      const foundUser = response.data;
      
      // Ensure the role is mapped correctly from number to 'ADMIN' | 'DOCTOR' | 'STAFF'
      foundUser.role = mapRoleFromBackend(foundUser.role);
      
      setUser(foundUser);
      localStorage.setItem('hms_user', JSON.stringify(foundUser));
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.response?.data || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hms_user');
  };

  const updateUser = (updatedUser: User) => {
    updatedUser.role = mapRoleFromBackend(updatedUser.role);
    setUser(updatedUser);
    localStorage.setItem('hms_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
