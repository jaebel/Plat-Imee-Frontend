import React, { useState, useContext } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { handleAddToList } from '../utils/handleAddToList';
import { handleViewDetails } from '../utils/handleViewDetails';
import '../styles/Recommendations.css';

const Recommendations = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [safeSearch, setSafeSearch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchInBatches = async (ids, batchSize = 5, delayMs = 400) => {
    const results = [];

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const responses = await Promise.all(
        batch.map(async (id) => {
          try {
            const res = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
            return res.data.data;
          } catch (err) {
            console.warn(`Jikan API failed for mal_id ${id}:`, err.message);
            return null;
          }
        })
      );
      results.push(...responses.filter(Boolean));
      await delay(delayMs); // Pause to avoid rate limiting
    }

    return results;
  };

  const fetchRecommendations = async () => {
    if (!user || !user.userId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/recs/me', {
        params: { safeSearch: safeSearch }
      });

      const ids = response.data.map(rec => rec.mal_id);
      const fetchedDetails = await fetchInBatches(ids);

      setRecommendations(fetchedDetails);
    } catch (err) {
      console.error(err);
      setError('Error fetching recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rec-page-container">
      <h1 className="rec-title">Recommendations</h1>

      <label className="rec-checkbox-label">
        <input
          type="checkbox"
          checked={safeSearch}
          onChange={() => setSafeSearch(!safeSearch)}
        />
        Enable Safe Search
      </label>

      <button className="rec-generate-btn" onClick={fetchRecommendations}>
        Generate Recommendations
      </button>

      {loading && <p className="rec-loading">Loading recommendations...</p>}
      {error && <p className="rec-error">{error}</p>}

      {!loading && recommendations.length === 0 && (
        <p className="rec-empty">No recommendations available yet. Click the button above to generate some!</p>
      )}

      {!loading && recommendations.length > 0 && (
        <ul className="rec-anime-list">
          {recommendations.map(anime => (
            <li key={anime.mal_id} className="rec-anime-item">
              <img
                src={anime.images?.jpg?.image_url}
                alt={anime.title}
                className="rec-anime-image"
                onClick={() => handleViewDetails(anime, navigate)}
              />
              <div className="rec-anime-info">
                <h2 className="rec-anime-title">{anime.title_english || anime.title}</h2>
                <p><strong>Type:</strong> {anime.type || 'Unknown'}</p>
                <p><strong>Aired:</strong> {anime.aired?.string || 'N/A'}</p>
                <p><strong>Rating:</strong> {anime.rating || 'N/A'}</p>

                {messages[anime.mal_id] && (
                  <p className={`rec-message ${messages[anime.mal_id].includes('added') ? 'rec-success' : 'rec-fail'}`}>
                    {messages[anime.mal_id]}
                  </p>
                )}

                <div className="rec-anime-actions">
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
    </div>
  );
};

export default Recommendations;
