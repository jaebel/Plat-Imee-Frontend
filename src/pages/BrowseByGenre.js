import React, { useState, useContext } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function mapJikanType(jikanType) {
  if (!jikanType) return "TV";
  const upper = jikanType.toUpperCase();
  switch (upper) {
    case "TV":
    case "MOVIE":
    case "OVA":
    case "ONA":
    case "SPECIAL":
      return upper;
    default:
      return "TV";
  }
}

const JIKAN_GENRE_OPTIONS = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 4, name: "Comedy" },
  { id: 7, name: "Mystery" },
  { id: 8, name: "Drama" },
  { id: 10, name: "Fantasy" },
  { id: 14, name: "Horror" },
  { id: 22, name: "Romance" },
  { id: 24, name: "Sci-Fi" },
  { id: 30, name: "Sports" },
];

const BrowseByGenre = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  const handleGenreChange = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleSearch = async () => {
    if (selectedGenres.length === 0) {
      setError('Please select at least one genre.');
      return;
    }

    setLoading(true);
    setError('');
    setMessages({});

    try {
      const genreString = selectedGenres.join(",");
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime?genres=${genreString}`
      );
      setResults(response.data.data || []);
    } catch (err) {
      console.error('Error browsing by genre:', err);
      setError('Failed to browse by genre.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewDetails = async (item) => {
    const malId = item.mal_id;
    try {
      await axiosInstance.get(`/anime/${malId}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          const jikanType = mapJikanType(item.type);
          const minimalGenres = [];
          const payload = {
            malId: malId,
            name: item.title_english || item.title,
            type: jikanType,
            episodes: item.episodes || 1,
            score: item.score || 0.0,
            aired: item.aired?.string || "",
            premiered: item.season || "",
            genres: minimalGenres
          };
          await axiosInstance.post('/anime', payload);
        } catch (createErr) {
          console.error('Error creating anime record:', createErr);
          setError('Failed to create local record for this anime.');
          return;
        }
      } else {
        console.error('Error checking local anime record:', err);
        setError('Error checking local anime record.');
        return;
      }
    }
    navigate(`/anime/${malId}`);
  };

  return (
    <div style={{ padding: '1em' }}>
      <h1>Browse Anime by Genre</h1>
      <p>Select one or more genres, then click "Search".</p>

      <div style={{ marginBottom: '1em' }}>
        {JIKAN_GENRE_OPTIONS.map(opt => (
          <label key={opt.id} style={{ marginRight: '1em' }}>
            <input
              type="checkbox"
              checked={selectedGenres.includes(opt.id)}
              onChange={() => handleGenreChange(opt.id)}
            />
            {opt.name}
          </label>
        ))}
      </div>

      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}

      {results.length > 0 && !loading && (
        <div style={{ marginTop: '2em' }}>
          <h2>Results</h2>
          <ul>
            {results.map(item => (
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
                <button
                  style={{ marginLeft: '0.5em' }}
                  onClick={() => handleViewDetails(item)}
                >
                  View Details
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '2em' }}>
        <Link to="/anime">View All Anime (Local)</Link>
      </div>
    </div>
  );
};

export default BrowseByGenre;
