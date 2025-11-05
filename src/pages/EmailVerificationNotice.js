import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/Auth.css';

const EmailVerificationNotice = () => {
  const location = useLocation();
  const email = location.state?.email;
  const userId = location.state?.userId;
  const initialMessage = location.state?.message; // message passed from login

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // On page load, show message from login if available
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleResendVerification = async () => {
    if (!userId) {
      setError('Unable to resend verification: user ID missing.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setCooldown(true);
    
    setTimeout(() => setCooldown(false), 60000); // 60-second cooldown

    try {
      const response = await axiosInstance.post(`/users/${userId}/verification`);
      setMessage(response.data.message || 'Verification email resent successfully!');
    } catch (err) {
      console.error(err);

      if (err.response?.status === 429) {
        setError('Please wait before trying again (rate limited).');
      } else {
        setError(err.response?.data?.message || 'Failed to resend verification email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Verify Your Email</h1>
        <p>
          Thanks for signing up{email ? `, ${email}` : ''}!<br />
          We’ve sent you an email with a link to verify your account.
        </p>
        <p>Please check your inbox (and spam folder just in case).</p>

        {/* Show backend or login-passed message */}
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <button onClick={handleResendVerification} disabled={loading || cooldown}>
          {loading
            ? 'Resending...'
            : cooldown
            ? 'On cooldown...'
            : 'Resend Verification Email'}
        </button>

        <Link to="/login" className="auth-link">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default EmailVerificationNotice;
