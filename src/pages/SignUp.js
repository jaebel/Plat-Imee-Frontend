import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import '../styles/SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      navigate('/');
    }
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

    try {
      const response = await axiosInstance.post('/users', form);
      setSuccess('User registered successfully!');
      console.log(response.data);
      navigate('/verify-email', { state: { email: response.data.email, userId: response.data.id } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Registration failed.');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1>Sign Up</h1>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input type="text" name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            First Name:
            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
          </label>
          <label>
            Last Name:
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
          </label>
          <label>
            Password:
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <label>
            Confirm Password:
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
          </label>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
