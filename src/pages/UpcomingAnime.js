import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';

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

              {messages[item.mal_id] && (
                <p style={{
                  color: messages[item.mal_id].includes('added') ? 'green' : 'red',
                  marginBottom: '0.5em'
                }}>
                  {messages[item.mal_id]}
                </p>
              )}

              <button onClick={() => handleAddToList(item.mal_id, user, setMessages)}>Add to My List</button>
              <button style={{ marginLeft: '0.5em' }} onClick={() => handleViewDetails(item, navigate)}>
                View Details
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '2em' }}>
        <button onClick={() => navigate(`?page=${page - 1}`)} disabled={page === 1}>
          Previous
        </button>
        <span style={{ margin: '0 1em' }}>Page {page}</span>
        <button onClick={() => navigate(`?page=${page + 1}`)}>Next</button>
      </div>
    </div>
  );
};

export default UpcomingAnime;
