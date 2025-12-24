import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, FrontendUser } from '@/types';
import { authService } from '@/services';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FrontendUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getCurrentUserFromStorage();
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
          // 获取用户权限信息
          await refreshUserPermissions();
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await authService.login({ username, password });
      setUser(response.user);
      setToken(response.token);
      // 登录后获取用户权限信息
      await refreshUserPermissions();
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const refreshUserPermissions = async (): Promise<void> => {
    if (!token) return;
    
    try {
      const permissionsData = await authService.getUserPermissions();
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          effectivePermissions: permissionsData.effectivePermissions,
          permissions: permissionsData.permissions,
          jobLevel: permissionsData.jobLevel,
        };
      });
    } catch (error) {
      console.error('Failed to refresh user permissions:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    refreshUserPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};