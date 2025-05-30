import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            </div>
          </div>
        ) : (
          <p>No profile data available.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
