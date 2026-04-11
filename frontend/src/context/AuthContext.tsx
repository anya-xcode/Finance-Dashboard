import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Timeout duration for auth check (in ms)
// Render free tier cold-starts can take 30-90s, so we give it a short window
// and gracefully redirect to login if it times out.
const AUTH_CHECK_TIMEOUT = 6000; // 6 seconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');

      // No token stored → skip API call, go straight to login
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Create an AbortController to enforce a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AUTH_CHECK_TIMEOUT);

        const response = await api.get('/auth/me', {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.data.success) {
          setUser(response.data.data);
        } else {
          // Token invalid — clear it
          logout();
        }
      } catch (error: any) {
        // If the request was aborted (timeout) or failed, clear the stale token
        console.warn('[AuthContext] Auth check failed or timed out, redirecting to login.');
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
