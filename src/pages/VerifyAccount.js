import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
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
    <div className="min-h-screen flex justify-center items-start pt-10 bg-[#1A2025]">
      <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-white">

        {/* Verifying */}
        {status === 'verifying' && (
          <h1 className="text-2xl text-center mb-4 border-b border-white pb-2">
            Verifying your account...
          </h1>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <h1 className="text-2xl text-center mb-4 border-b border-white pb-2">
              Account Verified 🎉
            </h1>

            <p className="text-[#00E676] text-center mb-3">{message}</p>

            <p className="text-center mb-4">
              You’ll be redirected shortly or you can go to login now.
            </p>

            <div className="w-max mt-2">
              <Link
                to="/login"
                className="text-sm text-[#bce6ff] hover:underline"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <h1 className="text-2xl text-center mb-4 border-b border-white pb-2">
              Verification Failed
            </h1>

            <p className="text-[#FF5252] text-center mb-3">{message}</p>

            <Link
              to="/login"
              className="block w-full mt-4 p-3 bg-[#4caf50] rounded-md text-center hover:bg-[#45a049] transition-colors"
            >
              Return to Login
            </Link>

          </>
        )}

      </div>
    </div>
  );
};

export default VerifyAccount;
