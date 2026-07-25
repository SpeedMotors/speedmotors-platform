import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user from local storage or token
    const storedUser = localStorage.getItem('speedmotors_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (role) => {
    let mockUser = { id: 1, name: 'Guest', role: role };
    switch (role) {
      case 'admin':
        mockUser.name = 'Admin User';
        break;
      case 'sales':
        mockUser.name = 'Sales Rep';
        break;
      case 'technician':
        mockUser.name = 'Tech Guru';
        break;
      case 'customer':
        mockUser.name = 'Valued Customer';
        break;
      default:
        mockUser.role = 'customer';
    }
    setUser(mockUser);
    localStorage.setItem('speedmotors_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('speedmotors_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
