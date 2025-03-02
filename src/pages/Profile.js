import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Call the new endpoint
        const response = await axiosInstance.get('/users/me');
        setProfile(response.data);
      } catch (err) {
        console.error(err);
        setError('Error fetching profile data.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if a token exists
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Profile</h1>
      {profile ? (
        <div>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>First Name:</strong> {profile.first_name}</p>
          <p><strong>Last Name:</strong> {profile.last_name}</p>
        </div>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default Profile;
