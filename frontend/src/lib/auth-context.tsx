'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  UserRole,
  loginApi,
  registerApi,
  getMeApi,
  RegisterInput,
} from './api';

const TOKEN_STORAGE_KEY = 'trh_auth_token';
const USER_STORAGE_KEY = 'trh_auth_user';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  isSeller: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isStaff: boolean;
  login: (identifier: string, password?: string) => Promise<{ user: AuthUser; role: UserRole }>;
  register: (input: RegisterInput) => Promise<{ user: AuthUser; role: UserRole }>;
  logout: () => void;
  refreshSession: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync token to cookie for SSR/middleware visibility
  const persistTokenCookie = useCallback((t: string | null) => {
    if (typeof document === 'undefined') return;
    if (t) {
      document.cookie = `trh_token=${t}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      document.cookie = 'trh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  }, []);

  const setSession = useCallback((newToken: string | null, newUser: AuthUser | null) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newToken && newUser) {
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        persistTokenCookie(newToken);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        persistTokenCookie(null);
      }
    }
  }, [persistTokenCookie]);

  const logout = useCallback(() => {
    setSession(null, null);
  }, [setSession]);

  const refreshSession = useCallback(async (): Promise<AuthUser | null> => {
    if (!token) return null;
    try {
      const refreshedUser = await getMeApi(token);
      setUser(refreshedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(refreshedUser));
      }
      return refreshedUser;
    } catch (err) {
      console.warn('[auth] Session verification failed, clearing session:', err);
      logout();
      return null;
    }
  }, [token, logout]);

  // Initial load: verify cached token against backend GET /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        // Optimistically set cached user to prevent layout flicker
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON parse failure
          }
        }
        setToken(storedToken);
        persistTokenCookie(storedToken);

        // Verify with real backend
        try {
          const liveUser = await getMeApi(storedToken);
          setUser(liveUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(liveUser));
        } catch (error) {
          console.warn('[auth] Stored token invalid or expired:', error);
          // Token is invalid/expired
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          persistTokenCookie(null);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('[auth] Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [persistTokenCookie]);

  const login = async (identifier: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await loginApi(identifier, password);
      setSession(res.token, res.user);
      return { user: res.user, role: res.user.role };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await registerApi(input);
      setSession(res.token, res.user);
      return { user: res.user, role: res.user.role };
    } finally {
      setIsLoading(false);
    }
  };

  const role = user?.role ?? null;
  const isSeller = role === 'SELLER';
  const isAdmin = role === 'ADMIN';
  const isAgent = role === 'AGENT';
  const isStaff = isAdmin || isAgent;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        role,
        isSeller,
        isAdmin,
        isAgent,
        isStaff,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
