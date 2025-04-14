import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';

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
    // Scroll to top when component mounts or page changes
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
    <div style={{ padding: '1em' }}>
      <h1>Top Anime</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {topAnime.map(anime => (
          <li
            key={anime.mal_id}
            style={{
              marginBottom: '1em',
              borderBottom: '1px solid #ccc',
              paddingBottom: '1em'
            }}
          >
            <h2>{anime.title_english || anime.title}</h2>
            {anime.images?.jpg?.image_url && (
              <img
                src={anime.images.jpg.image_url}
                alt="Anime Poster"
                style={{ width: '150px', cursor: 'pointer' }}
                onClick={() => handleViewDetails(anime, navigate)}
              />
            )}

            <p><strong>Type:</strong> {anime.type || 'TV'}</p>
            <p><strong>Aired:</strong> {anime.aired?.string || 'Unknown'}</p>
            <p><strong>Rating:</strong> {anime.score !== null ? anime.score : 'N/A'}</p>

            {messages[anime.mal_id] && (
              <p style={{
                color: messages[anime.mal_id].includes('added') ? 'green' : 'red',
                marginBottom: '0.5em'
              }}>
                {messages[anime.mal_id]}
              </p>
            )}

            <button onClick={() => handleAddToList(anime.mal_id, user, setMessages)}>Add to My List</button>
            <button style={{ marginLeft: '0.5em' }} onClick={() => handleViewDetails(anime, navigate)}>
              View Details
            </button>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
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

export default TopAnime;
