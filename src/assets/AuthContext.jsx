import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ track loading

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('appSessionId');
  };

  useEffect(() => {
    const storedSessionId = localStorage.getItem('appSessionId');
    const currentSessionId = sessionStorage.getItem('sessionId');

    // If no sessionId for this tab, generate one
    if (!currentSessionId) {
      const newSessionId = Date.now().toString();
      sessionStorage.setItem('sessionId', newSessionId);

      // If session mismatch, logout
      if (storedSessionId && storedSessionId !== newSessionId) {
        logout();
      }

      localStorage.setItem('appSessionId', newSessionId);
    }

    // Restore user/token from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false); // ✅ done loading
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, isAuthenticated, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
