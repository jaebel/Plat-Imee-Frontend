import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// import '../styles/Navbar.css';

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
        <div className="border-b border-gray-300">
            <nav className="flex items-center justify-between p-4 bg-[#36454F] text-white font-medium">

                {/* Left navbar*/}
                <div className="flex items-center space-x-4">
                    <NavLink to="/" className="font-bold text-lg">Plat-Imee</NavLink>
                    <form onSubmit={handleSearch}>
                        <input type="text" name="search" placeholder="Search anime..." className="px-2 py-1 rounded-l-md text-[#36454F] focus:outline-none" />
                        <button type="submit" className="bg-[#DEB8B8] text-[#36454F] px-3 py-1 rounded-r-md hover:bg-[#d6a8a8] transition-colors duration-300">Search</button>
                    </form>
                </div>

                {/* Middle navbar*/}
                <div>
                    {token && <NavLink to="/my-anime" className="fancy-underline">My Anime List</NavLink>}
                </div>
                
                {/* Right navbar*/}
                <div className="flex items-center space-x-6">
                    {token ? (
                        <>
                            <NavLink to="/profile" className="fancy-underline">
                                {user?.username || 'Profile'}
                            </NavLink>
                            <NavLink to="/recommendations" className="fancy-underline">Recommendations</NavLink>
                            <button onClick={logout} className="fancy-underline">Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/signup" className="fancy-underline">Sign Up</NavLink>
                            <NavLink to="/login" className="fancy-underline">Login</NavLink>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
