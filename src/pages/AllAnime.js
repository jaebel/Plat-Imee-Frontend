import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

  const handleViewDetails = (malId) => {
    navigate(`/anime/${malId}`);
  };

  return (
    <div style={{ padding: '1em' }}>
      <h1>All Anime</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {loading ? (
        <p>Loading anime...</p>
      ) : (
        <ul>
          {animeList.map(item => (
            <li
              key={item.mal_id}
              style={{
                marginBottom: '1em',
                borderBottom: '1px solid #ccc',
                paddingBottom: '1em'
              }}
            >
              <h3>{item.title_english || item.title}</h3>
              {item.images?.jpg?.image_url && (
                <img
                  src={item.images.jpg.image_url}
                  alt="Anime Poster"
                  style={{ width: '150px' }}
                />
              )}
              <p><strong>Type:</strong> {item.type || 'TV'}</p>
              <p><strong>Aired:</strong> {item.aired?.string || 'Unknown'}</p>
              <p><strong>Rating:</strong> {item.score !== null ? item.score : 'N/A'}</p>

              {messages[item.mal_id] && (
                <p style={{
                  color: messages[item.mal_id].includes('added') ? 'green' : 'red',
                  marginBottom: '0.5em'
                }}>
                  {messages[item.mal_id]}
                </p>
              )}

              <button onClick={() => handleAddToMyList(item.mal_id)}>Add to My List</button>
              <button style={{ marginLeft: '0.5em' }} onClick={() => handleViewDetails(item.mal_id)}>
                View Details
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div style={{ marginTop: '2em' }}>
        <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>
          Previous
        </button>
        <span style={{ margin: '0 1em' }}>Page {page}</span>
        <button onClick={() => setPage(prev => prev + 1)}>Next</button>
      </div>
    </div>
  );
};

export default AllAnime;
