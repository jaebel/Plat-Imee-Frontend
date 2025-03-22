import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const EditProfile = () => {
  const navigate = useNavigate();
  // Retrieve token and user details from AuthContext
  const { token, user, login } = useContext(AuthContext);

  // Local state for form fields, loading, error and success messages
  const [form, setForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '' // For security, leave password empty (only update if user enters a new one)
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch the current user profile when component mounts
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('No user logged in.');
      return;
    }
    axiosInstance.get('/users/me')
      .then(response => {
        const profile = response.data;
        // Pre-fill the form with the existing profile data
        setForm({
          username: profile.username || '',
          email: profile.email || '',
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          password: '' // Do not pre-fill password for security reasons
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching profile data.');
        setLoading(false);
      });
  }, [token]);

  // Update local state as the user types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission to update the user profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user || !user.userId) {
      setError('No user logged in.');
      return;
    }

    try {
      // Build payload; include password only if the field is non-empty
      const payload = {
        username: form.username,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        ...(form.password && { password: form.password })
      };

      // Send PATCH request to update the user's profile
      const res = await axiosInstance.patch(`/users/${user.userId}`, payload);
      setSuccess('Profile updated successfully!');
      console.log('Updated user:', res.data);
      
      // Optionally update AuthContext with new user details
      // For example: login(token, res.data);

      // Navigate back to the profile page after a successful update
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to update profile.');
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '1em' }}>
      <h1>Edit Profile</h1>
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        {/* Username Field */}
        <div style={{ marginBottom: '1em' }}>
          <label htmlFor="username"><strong>Username:</strong></label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        {/* Email Field */}
        <div style={{ marginBottom: '1em' }}>
          <label htmlFor="email"><strong>Email:</strong></label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        {/* First Name Field */}
        <div style={{ marginBottom: '1em' }}>
          <label htmlFor="firstName"><strong>First Name:</strong></label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
          />
        </div>
        {/* Last Name Field */}
        <div style={{ marginBottom: '1em' }}>
          <label htmlFor="lastName"><strong>Last Name:</strong></label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>
        {/* Password Field */}
        <div style={{ marginBottom: '1em' }}>
          <label htmlFor="password"><strong>Password:</strong></label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter new password if changing"
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;

//TODO remove ability to alter the username
