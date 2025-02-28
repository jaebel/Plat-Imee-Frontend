import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  // Redirect logged-in users to the home page
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
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axiosInstance.post('/users', form);
      setSuccess('User registered successfully!');
      console.log(response.data);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Registration failed.');
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" name="username" value={form.username} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Email:
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <br />
        <label>
          First Name:
          <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Last Name:
          <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Password:
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default SignUp;
