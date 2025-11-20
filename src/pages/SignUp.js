import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const [form, setForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailPattern = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordPattern = /^(?!.*\s)(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailPattern.test(form.email)) {
      setError('Email must be a valid format (e.g., user@example.com).');
      return;
    }

    if (form.firstName && (form.firstName.length < 2 || form.firstName.length > 50)) {
      setError('First name must be between 2 and 50 characters.');
      return;
    }

    if (form.lastName && (form.lastName.length < 2 || form.lastName.length > 50)) {
      setError('Last name must be between 2 and 50 characters.');
      return;
    }

    if (form.password) {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (!passwordPattern.test(form.password)) {
        setError('Password must be at least 8 characters, include a letter, a number, a special character, and contain no spaces.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/users', form);
      setSuccess('User registered successfully!');
      console.log(response.data);
      navigate('/verify-email', { state: { email: response.data.email, userId: response.data.id } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 bg-[#1A2025]">
      <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-white">

        <h1 className="text-2xl text-center mb-6 border-b border-white pb-2">
          Sign Up
        </h1>

        {error && (
          <div className="text-[#FF5252] text-center mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="text-[#00E676] text-center mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            Username:
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          <label className="flex flex-col text-sm">
            Email:
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          <label className="flex flex-col text-sm">
            First Name:
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          <label className="flex flex-col text-sm">
            Last Name:
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F] disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isLoading}
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          <label className="flex flex-col text-sm">
            Confirm Password:
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 p-3 bg-[#4caf50] rounded-md hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default SignUp;