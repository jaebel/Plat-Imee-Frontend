import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import '../styles/SignUp.css'; // Reusing the same styles

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
      const response = await axiosInstance.post('/auth/login', form);
      const { token: jwtToken, user } = response.data;
      login(jwtToken, user);
      navigate('/');
    } catch (err) {
      console.error(err);

      // If the backend says the user isn't verified, redirect to verification page
      const status = err.response?.status;
      const data = err.response?.data;

      // Extract the message (checks if we pass raw data or use headers as with the JSONJ standard)
      const message =
        typeof data === 'string' ? data : data?.message || '';

      if (status === 403 && message.toLowerCase().includes('not verified')) {

        // This way relies on the error message including the userId and email (not great)
        // Extract userId (e.g., "for user 12345")
        const userIdMatch = message.match(/for user\s+(\S+)/i);
        const extractedUserId = userIdMatch ? userIdMatch[1] : err.response?.data?.userId;

        // Extract email (e.g., "with email: test@example.com")
        const emailMatch = message.match(/with email:\s*([^\s]+)\s*-/i);
        const extractedEmail = emailMatch ? emailMatch[1] : form.username;

        navigate('/verify-email', {
          state: {
            email: extractedEmail,
            message: 'Your account isn’t verified yet. Please check your email or resend the verification link.',
            userId: extractedUserId
          }
        });
      } else {
        setError(err.response?.data?.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1>Login</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
