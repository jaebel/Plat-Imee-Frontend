import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/Auth.css';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const hasRunRef = useRef(false); // persists between effect runs

  useEffect(() => {
    if (hasRunRef.current) return; // prevent double-run in Strict Mode
    hasRunRef.current = true;

    let timer;

    const verifyAccount = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token missing or invalid.');
        return;
      }

      try {
        const response = await axiosInstance.get(`/users/verify`, { params: { token } });

        setStatus('success');

        // Ensure message is always a string
        const backendMessage =
          typeof response.data === 'string'
            ? response.data
            : response.data?.message || 'Your account has been verified successfully!';

        setMessage(backendMessage);

        // Redirect safely after 3 seconds
        timer = setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        console.error(err);
        setStatus('error');

        const backendMessage =
          typeof err.response?.data === 'string'
            ? err.response.data
            : err.response?.data?.message || 'Verification failed.';

        setMessage(backendMessage);
      }
    };

    verifyAccount();

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        {status === 'verifying' && <h1>Verifying your account...</h1>}

        {status === 'success' && (
          <>
            <h1>Account Verified 🎉</h1>
            <p className="success">{message}</p>
            <p>You’ll be redirected shortly or you can go to login now.</p>
            <Link to="/login" className="auth-link">Go to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1>Verification Failed</h1>
            <p className="error">{message}</p>
            <Link to="/login" className="auth-link">Return to Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
