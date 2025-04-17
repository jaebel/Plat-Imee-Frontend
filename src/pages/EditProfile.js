import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import '../styles/Profile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const [form, setForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('No user logged in.');
      return;
    }
    axiosInstance.get('/users/me')
      .then(response => {
        const profile = response.data;
        setForm({
          username: profile.username || '',
          email: profile.email || '',
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          password: ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching profile data.');
        setLoading(false);
      });
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user || !user.userId) {
      setError('No user logged in.');
      return;
    }

    try {
      const payload = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        ...(form.password && { password: form.password })
      };

      await axiosInstance.patch(`/users/${user.userId}`, payload);
      setSuccess('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to update profile.');
    }
  };

  if (loading) return <div className="profile-page"><div className="profile-container">Loading profile...</div></div>;
  if (error) return <div className="profile-page"><div className="profile-container" style={{ color: 'red' }}>{error}</div></div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Edit Profile</h1>
        {success && <div className="success">{success}</div>}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username"><strong>Username:</strong></label>
            <div id="username" className="readonly">{form.username}</div>
          </div>
          <div className="form-group">
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
          <div className="form-group">
            <label htmlFor="firstName"><strong>First Name:</strong></label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName"><strong>Last Name:</strong></label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
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
    </div>
  );
};

export default EditProfile;
