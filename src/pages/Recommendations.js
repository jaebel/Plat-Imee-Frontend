import React, { useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const Recommendations = () => {
  const { user } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [safeSearch, setSafeSearch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    if (!user || !user.userId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/recs/me', {
        params: {
          safeSearch: safeSearch
        }
      });
      setRecommendations(response.data);
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
        <p>No recommendations available.</p>
      )}

      {!loading && recommendations.length > 0 && (
        <ul>
          {recommendations.map((rec, index) => (
            <li key={index}>Anime ID: {rec.mal_id}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Recommendations;
