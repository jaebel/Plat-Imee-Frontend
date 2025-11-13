import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

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

                {/* Left navbar */}
                <div className="flex items-center space-x-4">
                    <NavLink to="/" className="font-bold text-lg whitespace-nowrap">Plat-Imee</NavLink>
                    <form onSubmit={handleSearch} className="flex flex-nowrap">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search anime..."
                            className="px-2 py-1 rounded-l-md text-[#36454F] focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-[#DEB8B8] text-[#36454F] px-3 py-1 rounded-r-md hover:bg-[#d6a8a8] transition-colors duration-300"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Middle navbar */}
                <div className="hidden sm:block px-4"> {/* padding on the container */}
                    {token && (
                        <NavLink to="/my-anime" className="fancy-underline whitespace-nowrap">
                            My Anime List
                        </NavLink>
                    )}
                </div>
                
                {/* Right navbar */}
                <div className="hidden sm:flex items-center gap-1 md:gap-2 lg:gap-6 transition-all duration-300 ease">
                
                    {token ? (
                        <>
                            <div className="px-2">
                                <NavLink to="/profile" className="fancy-underline">
                                    {user?.username || 'Profile'}
                                </NavLink>
                            </div>
                            <div className="px-2">
                                <NavLink to="/recommendations" className="fancy-underline">
                                    Recommendations
                                </NavLink>
                            </div>
                            <div className="px-2">
                                <button onClick={logout} className="fancy-underline">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="px-2">
                                <NavLink to="/signup" className="fancy-underline">
                                    Sign Up
                                </NavLink>
                            </div>
                            <div className="px-2">
                                <NavLink to="/login" className="fancy-underline">
                                    Login
                                </NavLink>
                            </div>
                        </>
                    )}
                </div>

                {/* Hamburger button for mobile */}
                <button
                    className="sm:hidden ml-2 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                        />
                    </svg>
                </button>
            </nav>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden bg-[#36454F] text-white px-4 py-2 space-y-2">
                    {token && <NavLink to="/my-anime" className="fancy-underline block">My Anime List</NavLink>}
                    {token ? (
                        <>
                            <NavLink to="/profile" className="fancy-underline block">
                                {user?.username || 'Profile'}
                            </NavLink>
                            <NavLink to="/recommendations" className="fancy-underline block">Recommendations</NavLink>
                            <button onClick={logout} className="fancy-underline block text-left w-full">Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/signup" className="fancy-underline block">Sign Up</NavLink>
                            <NavLink to="/login" className="fancy-underline block">Login</NavLink>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;
