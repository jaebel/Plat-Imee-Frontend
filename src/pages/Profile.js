import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { token, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/users/me');
        setProfile(response.data);
      } catch (err) {
        console.error(err);
        setError('Error fetching profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleDeleteConfirm = async () => {
    setDeleteError('');
    try {
      await axiosInstance.delete('/users/me');
      logout();
      setShowDeleteModal(false);
      navigate('/signup');
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data || 'Failed to delete account.');
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

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-start pt-20 bg-[#1a2025]">
        <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start pt-20 bg-[#1a2025]">
      <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-md text-white">
        <h1 className="text-2xl text-center mb-6 border-b border-white pb-2">Profile</h1>
        
        {profile ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 mb-4">
              <p className="text-sm">
                <strong className="text-gray-300">Username:</strong>
                <span className="ml-2">{profile.username}</span>
              </p>
              <p className="text-sm">
                <strong className="text-gray-300">Email:</strong>
                <span className="ml-2">{profile.email}</span>
              </p>
              <p className="text-sm">
                <strong className="text-gray-300">First Name:</strong>
                <span className="ml-2">{profile.first_name}</span>
              </p>
              <p className="text-sm">
                <strong className="text-gray-300">Last Name:</strong>
                <span className="ml-2">{profile.last_name}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Link
                to="/edit-profile"
                className="flex-1 p-3 bg-[#4caf50] rounded-md hover:bg-[#45a049] transition-colors text-center text-white no-underline"
              >
                Edit Profile
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 p-3 bg-[#d32f2f] rounded-md hover:bg-[#b71c1c] transition-colors text-white"
              >
                Delete Account
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-300">No profile data available.</p>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-full max-w-md p-8 bg-[#36454F] rounded-lg shadow-lg text-white mx-4">
            <h3 className="text-xl mb-4 border-b border-white pb-2">Confirm Account Deletion</h3>
            <p className="mb-6 text-sm text-gray-300">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="text-red-500 mb-4 text-center text-sm">{deleteError}</div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError('');
                }}
                className="flex-1 p-3 bg-[#666] rounded-md hover:bg-[#555] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 p-3 bg-[#d32f2f] rounded-md hover:bg-[#b71c1c] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;