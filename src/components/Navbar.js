import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css'; // Make sure this path matches your folder structure

const Navbar = () => {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="navbar-border">
      <nav className="navbar-container">
        {/* Left: Logo + Search */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">Plat-Imee</Link>
          <form onSubmit={handleSearch} className="navbar-search-form">
            <input type="text" name="search" placeholder="Search anime..." className="navbar-search-input" />
            <button type="submit" className="navbar-search-button">Search</button>
          </form>
        </div>

        {/* Center: My Anime List */}
        <div className="navbar-center">
          {token && <Link to="/my-anime">My Anime List</Link>}
        </div>

        {/* Right: Auth Controls */}
        <div className="navbar-right">
          {token ? (
            <>
              <Link to="/profile">{user?.username || 'Profile'}</Link>
              <Link to="/recommendations">Recommendations</Link>
              <button onClick={logout} className="navbar-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/signup">Sign Up</Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
