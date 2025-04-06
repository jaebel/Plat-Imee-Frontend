import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
    <div style={{ borderBottom: '1px solid #ccc' }}>
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1em',
          backgroundColor: '#f0f0f0'
        }}
      >
        {/* Left: Logo + Search */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5em' }}>
          <Link
            to="/"
            style={{
              fontWeight: 'bold',
              fontSize: '1.5em',
              textDecoration: 'none',
              color: '#333'
            }}
          >
            Plat-Imee
          </Link>

          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              name="search"
              placeholder="Search anime..."
              style={{ padding: '0.4em', width: '200px' }}
            />
            <button type="submit" style={{ marginLeft: '0.5em' }}>Search</button>
          </form>
        </div>

        {/* Center: My Anime List */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center'
        }}>
          {token && <Link to="/my-anime">My Anime List</Link>}
        </div>

        {/* Right: Auth Controls */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1em'
        }}>
          {token ? (
            <>
              <Link to="/profile">{user?.username || 'Profile'}</Link>
              <Link to="/recommendations">Recommendations</Link>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Logout
              </button>
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
