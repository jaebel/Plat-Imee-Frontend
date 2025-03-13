// import React from 'react';

// const Home = () => {
//   return (
//     <div>
//       <h1>Welcome to Plat-Imee</h1>
//       <p>Your personal anime discovery and recommendation platform.</p>
//     </div>
//   );
// };

// export default Home;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  // Local state for the search input
  const [searchText, setSearchText] = useState('');
  // Allows programmatic navigation
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      // Redirect to /search?query=someSearchTerm
      navigate(`/search?query=${encodeURIComponent(searchText.trim())}`);
    }
  };

  return (
    <div style={{ padding: '1em' }}>
      <h1>Welcome to Plat-Imee</h1>
      <p>Your personal anime discovery and recommendation platform.</p>
      
      {/* Basic search form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search anime..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      
      {/* You can add other links here, like top rated anime, or anything else later */}
      <div style={{ marginTop: '2em' }}>
        <a href="https://myanimelist.net/" target="_blank" rel="noopener noreferrer">
          Visit MyAnimeList
        </a>
      </div>
    </div>
  );
};

export default Home;
