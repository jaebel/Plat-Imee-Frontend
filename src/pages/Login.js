import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  // A hook is used to programmatically navigate after login.
  const navigate = useNavigate();

  // Retrieve the login func and token from AuthContext to update the global auth state.
  const { token, login } = useContext(AuthContext);

  // Redirect to home if the user is already logged in.
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  // Local state for form fields, error message, and loading indicator.
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Updates our form state as the user types.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Called when the user submits the login form.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    setError('');       // Clear any previous error messages
    setLoading(true);   // Set a loading state

    try {
      // Send a POST request to the login endpoint.
      const response = await axiosInstance.post('/auth/login', form);

      // Extract the token from the response data.
      const { token } = response.data;
      // Call the login function from the context to store the token in global state (and localStorage).
      login(token);
      // After successful login, navigate the user to the home page (or dashboard).
      navigate('/');
    } catch (err) {
      // If there's an error, log it and update the error state.
      console.error(err);
      // Show a specific message if available, otherwise a default.
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false); // End the loading state
    }
  };

  // The component's rendered output.
  return (
    <div className="login-container">
      <h1>Login</h1>
      {/* Conditionally render error messages */}
      {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Username field */}
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
        {/* Password field */}
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
