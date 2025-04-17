import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

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
                    <NavLink to="/" className="navbar-logo">Plat-Imee</NavLink>
                    <form onSubmit={handleSearch} className="navbar-search-form">
                        <input type="text" name="search" placeholder="Search anime..." className="navbar-search-input" />
                        <button type="submit" className="navbar-search-button">Search</button>
                    </form>
                </div>

                {/* Center: My Anime List */}
                <div className="navbar-center">
                    {token && <NavLink to="/my-anime" className="navbar-link">My Anime List</NavLink>}
                </div>

                {/* Right: Auth Controls */}
                <div className="navbar-right">
                    {token ? (
                        <>
                            <NavLink to="/profile" className="navbar-link">
                                {user?.username || 'Profile'}
                            </NavLink>
                            <NavLink to="/recommendations" className="navbar-link">Recommendations</NavLink>
                            <button onClick={logout} className="navbar-logout">Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/signup" className="navbar-link">Sign Up</NavLink>
                            <NavLink to="/login" className="navbar-link">Login</NavLink>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
