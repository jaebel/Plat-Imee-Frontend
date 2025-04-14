import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { handleViewDetails } from '../utils/handleViewDetails';

const SeasonalAnime = () => {
  const { user } = useContext(AuthContext);
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://api.jikan.moe/v4/seasons/now')
      .then(res => {
        setAnimeList(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching seasonal anime:', err);
        setError('Failed to fetch seasonal anime.');
        setLoading(false);
      });
  }, []);

  const handleAddToMyList = async (malId) => {
    const newMessages = { ...messages };

    if (!user || !user.userId) {
      newMessages[malId] = 'You must be logged in to add anime to your list.';
      setMessages(newMessages);
      return;
    }

    try {
      await axiosInstance.post('/user-anime', {
        userId: user.userId,
        malId: malId
      });
      newMessages[malId] = 'Anime added to your list!';
    } catch (err) {
      console.error('Error adding anime:', err);
      newMessages[malId] = 'Failed to add anime.';
    }

    setMessages(newMessages);
  };

  return (
    <div style={{ padding: '1em' }}>
      <h1>Trending This Season</h1>

      {loading && <p>Loading seasonal anime...</p>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <ul>
        {animeList.map(anime => (
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
                alt={anime.title}
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

            <button onClick={() => handleAddToMyList(anime.mal_id)}>Add to My List</button>
            <button
              style={{ marginLeft: '0.5em' }}
              onClick={() => handleViewDetails(anime, navigate)}
            >
              View Details
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeasonalAnime;
