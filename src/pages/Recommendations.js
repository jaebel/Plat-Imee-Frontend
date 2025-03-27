import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const Recommendations = () => {
  const { user } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Assuming your backend exposes GET /api/v1/recs/me for the current user
        const response = await axiosInstance.get('/recs/me');
        setRecommendations(response.data);
      } catch (err) {
        console.error(err);
        setError('Error fetching recommendations.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userId) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '1em' }}>
      <h1>Recommendations</h1>
      {recommendations.length === 0 ? (
        <p>No recommendations available.</p>
      ) : (
        <ul>
          {recommendations.map((rec, index) => (
            <li key={index}>
              Anime ID: {rec.mal_id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Recommendations;
