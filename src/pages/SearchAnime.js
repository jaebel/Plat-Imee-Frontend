import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useAnimeList } from '../context/AnimeListContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import '../styles/TopAnime.css'; // Shared styling

const SearchAnime = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const query = params.get('query') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  const { user } = useContext(AuthContext);
  const { setRecords } = useAnimeList(); // ✅ needed for forcing MyAnimeList refresh

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');

    axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`)
      .then(res => {
        setResults(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error searching anime:', err);
        setError('Error searching anime.');
        setLoading(false);
      });
  }, [query]);

  if (!query.trim()) {
    return <div className="top-anime-container">No search term provided.</div>;
  }

  if (loading) {
    return <div className="top-anime-container">Searching for "{query}"...</div>;
  }

  if (error) {
    return <div className="top-anime-container error">{error}</div>;
  }

  return (
    <div className="top-anime-container">
      <h1>Search Results for "{query}"</h1>

      {results.length === 0 ? (
        <p>No anime found.</p>
      ) : (
        <ul className="anime-list">
          {results.map(item => (
            <li key={item.mal_id} className="anime-item">
              <div className="anime-rank" style={{ visibility: 'hidden' }}>•</div>

              <img
                src={item.images?.jpg?.image_url}
                alt="Anime Poster"
                className="anime-image"
                onClick={() => handleViewDetails(item, navigate)}
              />

              <div className="anime-info">
                <h2 className="anime-title">
                  {item.title_english || item.title}
                </h2>

                <p><strong>Type:</strong> {item.type || 'TV'}</p>
                <p><strong>Aired:</strong> {item.aired?.string || 'Unknown'}</p>
                <p><strong>Rating:</strong> {item.score ?? 'N/A'}</p>

                {messages[item.mal_id] && (
                  <p className={`message ${messages[item.mal_id].includes('added') ? 'success' : 'fail'}`}>
                    {messages[item.mal_id]}
                  </p>
                )}

                <div className="anime-actions">
                  <button onClick={() => handleAddToList(item.mal_id, user, setMessages, setRecords)}>
                    Add to My List
                  </button>
                  <button onClick={() => handleViewDetails(item, navigate)}>
                    View Details
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchAnime;
