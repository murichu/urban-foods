import { createContext, useContext, useState, useCallback } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem('adminToken') || ''
  );

  const login = useCallback((token) => {
    localStorage.setItem('adminToken', token);
    setAdminToken(token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
  }, []);

  return (
    <AdminAuthContext.Provider value={{ adminToken, login, logout, isAuthenticated: !!adminToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
