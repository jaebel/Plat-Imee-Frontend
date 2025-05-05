import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import '../styles/TopAnime.css';

const TopAnime = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get('page') || '1', 10);

  const [topAnime, setTopAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.key]);

  useEffect(() => {
    setLoading(true);
    setError('');

    axios.get(`https://api.jikan.moe/v4/top/anime?page=${page}`)
      .then(res => {
        setTopAnime(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching top anime:', err);
        setError('Failed to fetch top anime.');
        setLoading(false);
      });
  }, [page]);

  return (
    <div className="top-anime-container">
      <h1>Top Anime</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="anime-list">
        {topAnime.map((anime, index) => (
          <li key={anime.mal_id} className="anime-item">
            <div className="anime-rank">{(page - 1) * 25 + index + 1}</div>

            <img
              src={anime.images?.jpg?.image_url}
              alt={anime.title}
              className="anime-image"
              onClick={() => handleViewDetails(anime, navigate)}
            />

            <div className="anime-info">
              <h2>{anime.title_english || anime.title}</h2>
              <p><strong>Type:</strong> {anime.type || 'TV'}</p>
              <p><strong>Aired:</strong> {anime.aired?.string || 'Unknown'}</p>
              <p><strong>Rating:</strong> {anime.score ?? 'N/A'}</p>

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
        <button onClick={() => navigate(`?page=${page + 1}`)}>Next</button>
      </div>
    </div>
  );
};

export default TopAnime;
