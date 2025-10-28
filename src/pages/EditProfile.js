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
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal-related state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [modalError, setModalError] = useState('');

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
          password: '',
          confirmPassword: ''
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

  const handleSaveClick = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password && form.password !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setShowPasswordModal(true);
  };

  const handleConfirmPasswordSubmit = async (e) => {
    e.preventDefault(); // So Enter works
    setModalError('');
    setError('');

    if (!currentPassword) {
      setModalError('Please enter your current password.');
      return;
    }

    if (!user || !user.userId) {
      setModalError('No user logged in.');
      return;
    }

    try {
      const payload = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        currentPassword,
        ...(form.password && { password: form.password })
      };

      await axiosInstance.patch(`/users/${user.userId}`, payload);
      setSuccess('Profile updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || 'Failed to update profile.';
      if (typeof msg === 'string' && msg.toLowerCase().includes('incorrect')) {
        setModalError('Incorrect current password. Please try again.');
      } else {
        setError(typeof msg === 'string' ? msg : 'Failed to update profile.');
        setShowPasswordModal(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Edit Profile</h1>
        {success && <div className="success">{success}</div>}
        {error && <div className="error" style={{ color: 'red' }}>{error}</div>}

        <form onSubmit={handleSaveClick} className="profile-form">
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
            <label htmlFor="password"><strong>New Password:</strong></label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter new password if changing"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword"><strong>Confirm New Password:</strong></label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
            />
          </div>

          <button type="submit">Save Changes</button>
        </form>
      </div>

      {/* Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Your Password</h3>
            <p>Please enter your current password to confirm these changes.</p>

            {modalError && <div className="error" style={{ color: 'red' }}>{modalError}</div>}

            <form onSubmit={handleConfirmPasswordSubmit}>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
              />

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setModalError('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
