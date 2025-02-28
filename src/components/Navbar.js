// File: src/components/Navbar.jsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        {token ? (
          <>
            <li><Link to="/profile">Profile</Link></li>
            <li>
              <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
