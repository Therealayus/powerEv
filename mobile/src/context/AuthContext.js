import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('token');
        const u = await AsyncStorage.getItem('user');
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistUser = async (userObj) => {
    await AsyncStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const userObj = { _id: data._id, name: data.name, email: data.email, emailVerified: data.emailVerified };
    await AsyncStorage.setItem('token', data.token);
    await persistUser(userObj);
    setToken(data.token);
    return data;
  };

  const register = async (name, email, password, vehicleType) => {
    const { data } = await api.post('/auth/register', { name, email, password, vehicleType });
    return data;
  };

  const completeVerification = async (payload) => {
    const userObj = { _id: payload.user._id, name: payload.user.name, email: payload.user.email, emailVerified: true };
    await AsyncStorage.setItem('token', payload.token);
    await persistUser(userObj);
    setToken(payload.token);
  };

  const refreshUser = async () => {
    const { data } = await getProfile();
    await persistUser(data);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, completeVerification, refreshUser, setUser: persistUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
