import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    setCooldown(true);

    setTimeout(() => setCooldown(false), 300000); // 5-minute cooldown

    try {
      const response = await axiosInstance.post('/password/forgot', null, {
        params: { email },
      });
      setMessage(response.data.message || 'Password reset email sent successfully.');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429) {
        setError('You are sending requests too quickly. Please wait before trying again.');
      } else {
        setError(err.response?.data || 'Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-20 bg-[#1a2025]">
      <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-white">
        <h1 className="text-2xl text-center mb-6 border-b border-white pb-2">
          Forgot Password
        </h1>

        <p className="text-center mb-4">
          Enter your email address below to receive a password reset link.
        </p>

        {message && (
          <div className="text-[#00E676] text-center mb-4">{message}</div>
        )}
        {error && (
          <div className="text-[#FF5252] text-center mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={cooldown}
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <button
            type="submit"
            disabled={loading || cooldown}
            className="mt-4 p-3 bg-[#4caf50] rounded-md hover:bg-[#45a049] transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Sending...'
              : cooldown
              ? 'On cooldown...'
              : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-2 w-max">
          <Link
            to="/login"
            className="text-sm text-[#bce6ff] hover:underline"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
