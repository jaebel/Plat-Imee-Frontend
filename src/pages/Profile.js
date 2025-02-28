import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  // Retrieve token (and logout function) from AuthContext.
  const { token } = useContext(AuthContext);

  return (
    <div>
      <h1>Profile</h1>
      <p>This is a protected page - must be logged in to see this.</p>
      <p>Token: {token}</p>
      <p>Your token: {token ? token : "No token found"}</p>
    </div>
  );
};

export default Profile;
