import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

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
    <div className="min-h-screen flex justify-center items-start pt-10 bg-[#1A2025]">
      <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-white">

        <h1 className="text-2xl text-center mb-4 border-b border-white pb-2">
          Verify Your Email
        </h1>

        <p className="text-center mb-2">
          Thanks for signing up with {email ? `${email}` : ''}!<br />
          We’ve sent you an email with a link to verify your account.
        </p>

        <p className="text-center mb-4">
          Please check your inbox (and spam folder just in case).
        </p>

        {message && (
          <p className="text-[#00E676] text-center mb-3">{message}</p>
        )}
        {error && (
          <p className="text-[#FF5252] text-center mb-3">{error}</p>
        )}

        <button
          onClick={handleResendVerification}
          disabled={loading || cooldown}
          className={`w-full p-3 rounded-md mt-2 transition-colors
            ${loading || cooldown 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-[#4caf50] hover:bg-[#45a049]'
            }
          `}
        >
          {loading
            ? 'Resending...'
            : cooldown
            ? 'On cooldown...'
            : 'Resend Verification Email'}
        </button>

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

export default EmailVerificationNotice;
