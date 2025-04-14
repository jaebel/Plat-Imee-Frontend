import React, { useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleAddToList } from '../utils/handleAddToList';
import { handleViewDetails } from '../utils/handleViewDetails';

const Recommendations = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [safeSearch, setSafeSearch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  const fetchRecommendations = async () => {
    if (!user || !user.userId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/recs/me', {
        params: { safeSearch: safeSearch }
      });

      const ids = response.data.map(rec => rec.mal_id);

      const fetchedDetails = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
            return res.data.data;
          } catch {
            return null;
          }
        })
      );

      setRecommendations(fetchedDetails.filter(item => item !== null));
    } catch (err) {
      console.error(err);
      setError('Error fetching recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1em' }}>
      <h1>Recommendations</h1>

      <label>
        <input
          type="checkbox"
          checked={safeSearch}
          onChange={() => setSafeSearch(!safeSearch)}
        />
        Enable Safe Search
      </label>

      <br /><br />
      <button onClick={fetchRecommendations}>Generate Recommendations</button>

      {loading && <p>Loading recommendations...</p>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && recommendations.length === 0 && (
        <p>No recommendations available yet. Click the button above to generate some!</p>
      )}

      {!loading && recommendations.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {recommendations.map(anime => (
            <li key={anime.mal_id} style={{ marginBottom: '2em', borderBottom: '1px solid #ccc', paddingBottom: '1em' }}>
              <h2>{anime.title_english || anime.title}</h2>
              {anime.images?.jpg?.image_url && (
                <img
                  src={anime.images.jpg.image_url}
                  alt={anime.title}
                  style={{ width: '150px', cursor: 'pointer' }}
                  onClick={() => handleViewDetails(anime, navigate)}
                />
              )}
              <p><strong>Type:</strong> {anime.type || 'Unknown'}</p>
              <p><strong>Aired:</strong> {anime.aired?.string || 'N/A'}</p>
              <p><strong>Rating:</strong> {anime.rating || 'N/A'}</p>

              {messages[anime.mal_id] && (
                <p style={{
                  color: messages[anime.mal_id].includes('added') ? 'green' : 'red',
                  marginBottom: '0.5em'
                }}>
                  {messages[anime.mal_id]}
                </p>
              )}

              <button onClick={() => handleAddToList(anime.mal_id, user, setMessages)}>Add to My List</button>
              <button style={{ marginLeft: '0.5em' }} onClick={() => handleViewDetails(anime, navigate)}>View Details</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Recommendations;
