import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

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

  if (loading) return <div className="profile-page"><div className="profile-container">Loading profile...</div></div>;
  if (error) return <div className="profile-page"><div className="profile-container" style={{ color: 'red' }}>{error}</div></div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Profile</h1>
        {profile ? (
          <div className="profile-info">
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>First Name:</strong> {profile.first_name}</p>
            <p><strong>Last Name:</strong> {profile.last_name}</p>

            <div>
              <Link to="/edit-profile" className="profile-edit-link">Edit Profile</Link>
              <button
                id="delete-account-btn"
                onClick={() => setShowDeleteModal(true)}
                style={{ marginLeft: '10px'}}
              >
                Delete Account
              </button>
            </div>
          </div>
        ) : (
          <p>No profile data available.</p>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Account Deletion</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>

            {deleteError && <div className="error" style={{ color: 'red' }}>{deleteError}</div>}

            <div className="modal-actions">
              <button
                type="button"
                id="cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError('');
                }}
              >
                Cancel
              </button>
              <button
                id="delete"
                onClick={handleDeleteConfirm}
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
