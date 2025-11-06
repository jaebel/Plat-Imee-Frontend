import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/Auth.css';

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
    <div className="auth-page">
      <div className="auth-container">
        <h1>Reset Your Password</h1>
        <p>Enter a new password for your account.</p>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Confirm Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
