import React, { createContext, useState, useEffect } from 'react';

// Create a context with default values
export const AuthContext = createContext({
  token: null,        // Initially no token
  login: (token) => {},  // Function to log in (set the token)
  logout: () => {}       // Function to log out (clear the token)
});

// AuthProvider to wrap around app
// Provides the AuthContext value to all child components so like props but not
export const AuthProvider = ({ children }) => {
  // Initialize the token state from localStorage (if available)
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Keep localStorage in sync with the token state
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Define a function to log in (set the token)
  const login = (newToken) => {
    setToken(newToken);
  };

  // Define a function to log out (clear the token)
  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
