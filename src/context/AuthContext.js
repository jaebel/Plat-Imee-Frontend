import React, { createContext, useState, useEffect } from 'react';

// Create a context with default values
export const AuthContext = createContext({
  token: null,          // JWT token
  user: null,           // Object with user info, e.g. { userId, username, email }
  login: () => {},      // Function to log in
  logout: () => {}      // Func to log out
});

export const AuthProvider = ({ children }) => {
  // Read initial token and user from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Keep localStorage in sync with the token
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Keep localStorage in sync with the user object
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
