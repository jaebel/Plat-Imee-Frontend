import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import '../styles/TopAnime.css';

const UpcomingAnime = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get('page') || '1', 10);

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`https://api.jikan.moe/v4/seasons/upcoming?page=${page}`)
      .then(res => {
        setAnimeList(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching upcoming anime:', err);
        setError('Failed to fetch upcoming anime.');
        setLoading(false);
      });
  }, [page]);

  return (
    <div className="top-anime-container">
      <h1>Upcoming Anime</h1>

      {loading && <p>Loading upcoming anime...</p>}
      {error && <p className="error">{error}</p>}

      {animeList.length === 0 ? (
        <p>No upcoming anime found.</p>
      ) : (
        <ul className="anime-list">
          {animeList.map(item => (
            <li key={item.mal_id} className="anime-item">
              <div className="anime-rank" style={{ visibility: 'hidden' }}>•</div>

              <img
                src={item.images?.jpg?.image_url}
                alt={item.title}
                className="anime-image"
              />

              <div className="anime-info">
                <h2 className="anime-title">
                  {item.title_english || item.title}
                </h2>

                {item.synopsis && (
                  <p><strong>Synopsis:</strong> {item.synopsis}</p>
                )}
                <p><strong>Type:</strong> {item.type || 'TV'}</p>
                <p><strong>Aired:</strong> {item.aired?.string || 'Unknown'}</p>
                <p><strong>Rating:</strong> {item.score ?? 'N/A'}</p>

                {messages[item.mal_id] && (
                  <p className={`message ${messages[item.mal_id].includes('added') ? 'success' : 'fail'}`}>
                    {messages[item.mal_id]}
                  </p>
                )}

                <div className="anime-actions">
                  <button onClick={() => handleAddToList(item.mal_id, user, setMessages)}>
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

export default UpcomingAnime;
