import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

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

  // Validation regex patterns (matching the backend)
  const emailPattern = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordPattern = /^(?!.*\s)(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
        setError('New passwords do not match.');
        return;
      }

      if (!passwordPattern.test(form.password)) {
        setError('Password must be at least 8 characters, include a letter, a number, a special character, and contain no spaces.');
        return;
      }
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
      <div className="min-h-screen flex justify-center items-start pt-20 bg-[#1a2025]">
        <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-white">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 bg-[#1a2025]">
      <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-white">
        <h1 className="text-2xl text-center mb-6 border-b border-white pb-2">Edit Profile</h1>

        {success && (
          <div className="text-[#00E676] text-center mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="text-red-500 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveClick} className="flex flex-col gap-4">
          <div className="flex flex-col text-sm">
            <label className="mb-1">
              <strong>Username:</strong>
            </label>
            <div className="p-3 rounded-md bg-[#555] text-gray-300 border border-[#444]">
              {form.username}
            </div>
          </div>

          <label className="flex flex-col text-sm">
            <strong>Email:</strong>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <label className="flex flex-col text-sm">
            <strong>First Name:</strong>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <label className="flex flex-col text-sm">
            <strong>Last Name:</strong>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <label className="flex flex-col text-sm">
            <strong>New Password:</strong>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter new password if changing"
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <label className="flex flex-col text-sm">
            <strong>Confirm New Password:</strong>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              className="mt-1 p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36454F]"
            />
          </label>

          <button
            type="submit"
            className="mt-4 p-3 bg-[#4caf50] rounded-md hover:bg-[#45a049] transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-lg text-white mx-4">
            <h3 className="text-xl mb-4 border-b border-white pb-2">Confirm Your Password</h3>
            <p className="mb-6 text-sm text-gray-300">
              Please enter your current password to confirm these changes.
            </p>

            {modalError && (
              <div className="text-red-500 mb-4 text-center text-sm">{modalError}</div>
            )}

            <form onSubmit={handleConfirmPasswordSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
                className="p-3 rounded-md border border-[#444] bg-[#DEB8B8] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36454F]"
              />

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setModalError('');
                  }}
                  className="flex-1 p-3 bg-[#666] rounded-md hover:bg-[#555] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 bg-[#4caf50] rounded-md hover:bg-[#45a049] transition-colors"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;