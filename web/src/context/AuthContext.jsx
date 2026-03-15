import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (token && u) {
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    if (data.role !== 'partner' && data.role !== 'admin') {
      throw new Error('Partner or admin account required.');
    }
    const userObj = { _id: data._id, name: data.name, email: data.email, role: data.role, emailVerified: data.emailVerified };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await apiRegister({ name, email, password, role: 'partner' });
    // Do not log in until email is verified; caller navigates to verify-email
    return data;
  };

  const completeVerification = (payload) => {
    const userObj = { _id: payload.user._id, name: payload.user.name, email: payload.user.email, role: payload.user.role, emailVerified: true };
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, completeVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

import { login as apiLogin, register as apiRegister } from '../api';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
