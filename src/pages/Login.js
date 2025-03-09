// Login.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { token, login } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call login endpoint
      const response = await axiosInstance.post('/auth/login', form);
      // The response should contain { token, user: { userId, username, email } }
      const { token: jwtToken, user } = response.data;

      // Store both the token and user data in AuthContext
      login(jwtToken, user);

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="username">Username:</label>
          <input 
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password:</label>
          <input 
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
