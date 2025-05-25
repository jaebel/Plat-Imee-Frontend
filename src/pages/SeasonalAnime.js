import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import '../styles/TopAnime.css'; // Reuse shared styling

const SeasonalAnime = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get('page') || '1', 10);

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`https://api.jikan.moe/v4/seasons/now?page=${page}`)
      .then(res => {
        setAnimeList(res.data.data || []);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch(err => {
        console.error('Error fetching seasonal anime:', err);
        setError('Failed to fetch seasonal anime.');
        setLoading(false);
      });
  }, [location.search, page]);

  return (
    <div className="top-anime-container">
      <h1>Trending This Season</h1>

      {loading && <p>Loading seasonal anime...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="anime-list">
        {animeList.map(anime => (
          <li key={anime.mal_id} className="anime-item">
            <div className="anime-rank" style={{ visibility: 'hidden' }}>•</div>

            <img
              src={anime.images?.jpg?.image_url}
              alt={anime.title}
              className="anime-image"
              onClick={() => handleViewDetails(anime, navigate)}
            />

            <div className="anime-info">
              <h2 className="anime-title">
                {anime.title_english || anime.title}
              </h2>

              <p><strong>Type:</strong> {anime.type || 'TV'}</p>
              <p><strong>Aired:</strong> {anime.aired?.string || 'Unknown'}</p>
              <p><strong>Rating:</strong> {anime.score !== null ? anime.score : 'N/A'}</p>

              {messages[anime.mal_id] && (
                <p className={`message ${messages[anime.mal_id].includes('added') ? 'success' : 'fail'}`}>
                  {messages[anime.mal_id]}
                </p>
              )}

              <div className="anime-actions">
                <button onClick={() => handleAddToList(anime.mal_id, user, setMessages)}>
                  Add to My List
                </button>
                <button onClick={() => handleViewDetails(anime, navigate)}>
                  View Details
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button onClick={() => navigate(`?page=${page - 1}`)} disabled={page === 1}>
          Previous
        </button>
        <span className="page-number">Page {page}</span>
        <button onClick={() => navigate(`?page=${page + 1}`)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default SeasonalAnime;
