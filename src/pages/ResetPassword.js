import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/password/reset`, null, {
        params: { token, newPassword },
      });

      setMessage(response.data.message || 'Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);

      if (!err.response) {
        setError('Network error. Please try again later.');
        return;
      }

      const { status, data } = err.response;
      // normalise backend message, whether string or object
      const msg =
        typeof data === 'string'
          ? data
          : typeof data === 'object'
          ? data.message
          : '';

      if (status === 400 && msg?.toLowerCase().includes('invalid')) {
        setError('This password reset link is invalid. Please request a new one.');
      } else if (status === 400 && msg?.toLowerCase().includes('expired')) {
        setError('This password reset link has expired. Please request a new one.');
      } else if (status === 400 && msg?.toLowerCase().includes('used')) {
        setError('This password reset link has already been used.');
      } else {
        setError(msg || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-20 bg-[#1a2025]">
      <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-white">
        <h1 className="text-2xl text-center mb-4 border-b border-white pb-2">
          Reset Your Password
        </h1>
        <p className="text-sm text-gray-300 text-center mb-6">
          Enter a new password for your account.
        </p>

        {message && (
          <div className="text-[#00E676] text-center mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="text-red-500 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <label className="flex flex-col text-sm">
            Confirm Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 p-3 bg-[#4caf50] rounded-md hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;