import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('speedmotors_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      if (res.data.success) {
        const dbUser = res.data.data.user;
        const token = res.data.data.token;
        setUser(dbUser);
        localStorage.setItem('speedmotors_user', JSON.stringify(dbUser));
        localStorage.setItem('speedmotors_token', token);
        return dbUser; // Return the user object so callers can retrieve the role
      }
    } catch (err) {
      console.error('Frontend login API error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    localStorage.removeItem('speedmotors_user');
    localStorage.removeItem('speedmotors_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
