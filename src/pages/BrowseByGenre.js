import React, { useState, useContext } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { handleViewDetails } from '../utils/handleViewDetails';

const JIKAN_GENRE_OPTIONS = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 3, name: "Racing" },
  { id: 4, name: "Comedy" },
  { id: 5, name: "Avant Garde" },
  { id: 6, name: "Mythology" },
  { id: 7, name: "Mystery" },
  { id: 8, name: "Drama" },
  // skipped ecchi
  { id: 10, name: "Fantasy" },
  { id: 11, name: "Strategy Game" },
  // skipped hentai
  { id: 13, name: "Historical" },
  { id: 14, name: "Horror" },
  { id: 15, name: "Kids" },
  { id: 18, name: "Mecha" },
  { id: 19, name: "Music" },
  { id: 20, name: "Parody" },
  { id: 21, name: "Samurai" },
  { id: 22, name: "Romance" },
  { id: 23, name: "School" },
  { id: 24, name: "Sci-Fi" },
  { id: 25, name: "Shoujo" },
  { id: 26, name: "Girls Love" },
  { id: 27, name: "Shounen" },
  { id: 28, name: "Boys Love" },
  { id: 29, name: "Space" },
  { id: 30, name: "Sports" },
  { id: 31, name: "Super Power" },
  { id: 32, name: "Vampire" },
  { id: 35, name: "Harem" },
  { id: 36, name: "Sllice of Life" },
  { id: 37, name: "Supernatural" },
  { id: 38, name: "Military" },
  { id: 39, name: "Detective" },
  { id: 40, name: "Psychological" },
  { id: 41, name: "Suspense" },
  { id: 42, name: "Seinen" },
  { id: 43, name: "Josei" },
  { id: 44, name: "Award Winning" },
  { id: 47, name: "Gourmet" },
  { id: 48, name: "Workplace" },
  { id: 50, name: "Adult Cast" },
  { id: 51, name: "Anthropomorphic" },
  { id: 52, name: "CGDCT" },
  { id: 53, name: "Childcare" },
  { id: 54, name: "Combat Sports" },
  { id: 55, name: "Delinquents" },
  { id: 56, name: "Educational" },
  { id: 57, name: "Gag Humor" },
  { id: 58, name: "Gore" },
  { id: 59, name: "High Stakes Game" },
  { id: 60, name: "Idols (Female)" },
  { id: 61, name: "Idols (Male)" },
  { id: 62, name: "Isekai" },
  { id: 63, name: "Iyashikei" },
  { id: 64, name: "Love Polygon" },
  // skipped Magical Sex Shift
  { id: 66, name: "Mahou Shoujo" },
  { id: 67, name: "Medical" },
  { id: 68, name: "Organized Crime" },
  { id: 69, name: "Otaku Culture" },
  { id: 70, name: "Performing Arts" },
  { id: 71, name: "Pets" },
  { id: 72, name: "Reincarnation" },
  { id: 73, name: "Reverse Harem" },
  { id: 74, name: "GorLove Status Quoe" },
  { id: 75, name: "Showbiz" },
  { id: 76, name: "Survival" },
  { id: 77, name: "Team Sports" },
  { id: 78, name: "Time Travel" },
  { id: 79, name: "Video Game" },
  { id: 80, name: "Visual Arts" },
  { id: 81, name: "Crossdressing" },
  { id: 82, name: "Urban Fantasy" },
  { id: 83, name: "Villainess" },
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
                    style={{ width: '150px', cursor: 'pointer' }}
                    onClick={() => handleViewDetails(item, navigate)}
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
                  onClick={() => handleViewDetails(item, navigate)}
                >
                  View Details
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BrowseByGenre;
