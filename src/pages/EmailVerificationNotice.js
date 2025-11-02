import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Auth.css';

const EmailVerificationNotice = () => {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Verify Your Email</h1>
        <p>
          Thanks for signing up{email ? `, ${email}` : ''}!<br />
          We’ve sent you an email with a link to verify your account.
        </p>
        <p>
          Please check your inbox (and spam folder just in case).
        </p>
        <Link to="/login" className="auth-link">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default EmailVerificationNotice;
