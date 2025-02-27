import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection after login
import axiosInstance from '../api/axiosInstance'; // Our configured axios instance

const Login = () => {
  const navigate = useNavigate();
  // State to hold form input for username and password
  const [form, setForm] = useState({ username: '', password: '' });
  // State to track error messages and loading status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form state when the user types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Send a POST request to the login endpoint with the username and password
      const response = await axiosInstance.post('/auth/login', form);
      // Assume the response returns a token on successful authentication
      const { token } = response.data;
      // Save the token (e.g., in local storage) for subsequent authenticated requests
      localStorage.setItem('token', token);
      // Redirect to the home page (or dashboard)
      navigate('/');
    } catch (err) {
      console.error(err);
      // Display an error message from the response or a default message
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
