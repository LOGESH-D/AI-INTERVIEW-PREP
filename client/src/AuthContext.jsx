import React, { createContext, useState, useEffect } from 'react';
import API from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const res = await API.post('/auth/login', { email, password });
      
      console.log('✅ Login response:', res.data);
      
      if (res.data.token && res.data.user) {
        setToken(res.data.token);
        setUser(res.data.user);
        console.log('✅ Login successful, user set:', res.data.user.email);
        return res.data;
      } else {
        console.error('❌ Invalid login response:', res.data);
        throw new Error('Invalid login response from server');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('📝 Attempting registration for:', email);
      
      await API.post('/auth/register', { username: name, email, password });
      console.log('✅ Registration successful');
      
      return login(email, password);
    } catch (err) {
      console.error('❌ Register error:', err);
      console.error('❌ Error response:', err.response?.data);
      throw err;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 