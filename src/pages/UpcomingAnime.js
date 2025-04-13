import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { handleViewDetails } from '../utils/handleViewDetails';

const UpcomingAnime = () => {
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get('https://api.jikan.moe/v4/seasons/upcoming')
      .then(res => {
        setAnimeList(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching upcoming anime:', err);
        setError('Failed to fetch upcoming anime.');
        setLoading(false);
      });
  }, []);

  const handleAddToMyList = async (malId) => {
    if (!user || !user.userId) {
      alert('Please log in first!');
      return;
    }
    try {
      await axiosInstance.post('/user-anime', {
        userId: user.userId,
        malId: malId
      });
      alert('Anime added to your list!');
    } catch (err) {
      console.error('Error adding anime:', err);
      alert('Failed to add anime.');
    }
  };

  if (loading) return <div>Loading upcoming anime...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '1em' }}>
      <h1>Upcoming Anime</h1>
      {animeList.length === 0 ? (
        <p>No upcoming anime found.</p>
      ) : (
        <ul>
          {animeList.map(item => (
            <li
              key={item.mal_id}
              style={{ marginBottom: '1em', borderBottom: '1px solid #ccc', paddingBottom: '1em' }}
            >
              <h2
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => handleViewDetails(item, navigate)}
              >
                {item.title_english || item.title}
              </h2>
              {item.images?.jpg?.image_url && (
                <img
                  src={item.images.jpg.image_url}
                  alt="Anime Poster"
                  style={{ width: '150px', cursor: 'pointer' }}
                  onClick={() => handleViewDetails(item, navigate)}
                />
              )}
              {item.synopsis && (
                <p><strong>Synopsis:</strong> {item.synopsis}</p>
              )}

              <button onClick={() => handleAddToMyList(item.mal_id)}>Add to My List</button>
              <button style={{ marginLeft: '0.5em' }} onClick={() => handleViewDetails(item, navigate)}>
                View Details
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '2em' }}>
        <Link to="/anime">View All Anime (Local)</Link>
      </div>
    </div>
  );
};

export default UpcomingAnime;
