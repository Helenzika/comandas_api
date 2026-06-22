import { createContext, useState, useContext, useEffect } from 'react';
// IMPORTANTE: Se o seu arquivo terminar com 's', mude abaixo para authServices.js
import { authService } from '../services/authService.js';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      authService.getUserData().then(data => {
        if (data) setUser(data);
      });
    }
  }, [isAuthenticated]);

  const login = async (cpf, password) => {
    const response = await authService.login(cpf, password);
    if (response.success) {
      setIsAuthenticated(true);
      const userData = await authService.getUserData();
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);