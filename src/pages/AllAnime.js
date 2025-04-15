import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import '../styles/TopAnime.css'; // Reuse shared stylesheet

const AllAnime = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?page=${page}`);
        setAnimeList(response.data.data || []);
      } catch (err) {
        console.error('Error fetching anime:', err);
        setError('Failed to load anime list.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [page]);

  return (
    <div className="top-anime-container">
      <h1>All Anime</h1>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading anime...</p>
      ) : (
        <ul className="anime-list">
          {animeList.map(anime => (
            <li key={anime.mal_id} className="anime-item">
              {/* Invisible rank to preserve layout structure */}
              <div className="anime-rank" style={{ visibility: 'hidden' }}>•</div>

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
      )}

      <div className="pagination">
        <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>
          Previous
        </button>
        <span className="page-number">Page {page}</span>
        <button onClick={() => setPage(prev => prev + 1)}>Next</button>
      </div>
    </div>
  );
};

export default AllAnime;
