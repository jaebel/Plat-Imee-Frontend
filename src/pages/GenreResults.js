import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import '../styles/TopAnime.css';

const GenreResults = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const genres = params.get('genres');

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  useEffect(() => {
    if (!genres) return;

    setLoading(true);
    setError('');
    axios.get(`https://api.jikan.moe/v4/anime?genres=${genres}`)
      .then(res => {
        setAnimeList(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching genre results:', err);
        setError('Failed to load results.');
        setLoading(false);
      });
  }, [genres]);

  return (
    <div className="top-anime-container">
      <h1>Genre Results</h1>

      {loading && <p>Loading anime...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="anime-list">
        {animeList.map(item => (
          <li key={item.mal_id} className="anime-item">
            <div className="anime-rank" style={{ visibility: 'hidden' }}>•</div>

            <img
              src={item.images?.jpg?.image_url}
              alt="Anime Poster"
              className="anime-image"
              onClick={() => handleViewDetails(item, navigate)}
            />

            <div className="anime-info">
              <h2 className="anime-title">{item.title_english || item.title}</h2>
              <p><strong>Type:</strong> {item.type || 'TV'}</p>
              <p><strong>Aired:</strong> {item.aired?.string || 'Unknown'}</p>
              <p><strong>Rating:</strong> {item.score !== null ? item.score : 'N/A'}</p>

              <div className="anime-actions">
                <button onClick={() => handleAddToList(item.mal_id, user, setMessages)}>Add to My List</button>
                <button onClick={() => handleViewDetails(item, navigate)}>View Details</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GenreResults;
