import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen flex justify-center items-start pt-20 bg-[#1a2025]">
      <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-white">
        <h1 className="text-2xl text-center mb-6 border-b border-white pb-2">Login</h1>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            Username:
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <label className="flex flex-col text-sm">
            Password:
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 p-3 bg-[#4caf50] rounded-md hover:bg-[#45a049] transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="mt-2 w-max">
            <Link
              to="/forgot-password"
              className="text-sm text-[#bce6ff] hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
