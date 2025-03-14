import React, { useState, useContext } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Helper to map Jikan's "type" to your enum
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

// A simple mapping from Jikan's known genre IDs to their names
// For example, 1 = Action, 2 = Adventure, etc.
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
  // ... add more if you like
];

const BrowseByGenre = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State for selected genres, results, loading, error
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Toggle genre in or out of selectedGenres
  const handleGenreChange = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  // Build the query param and fetch from Jikan
  const handleSearch = async () => {
    if (selectedGenres.length === 0) {
      alert('Please select at least one genre.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Jikan's advanced search can accept multiple genres as a comma-separated list
      // e.g., ?genres=1,2 for Action+Adventure
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

  const handleViewDetails = async (item) => {
    const malId = item.mal_id;
    try {
      await axiosInstance.get(`/anime/${malId}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          const jikanType = mapJikanType(item.type);
          const minimalGenres = []; // or parse if you want local genre IDs
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
          alert('Failed to create local record for this anime.');
          return;
        }
      } else {
        console.error('Error checking local anime record:', err);
        alert('Error checking local anime record.');
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
                style={{ marginBottom: '1em', borderBottom: '1px solid #ccc', paddingBottom: '1em' }}
              >
                <h3>{item.title_english || item.title}</h3>
                {item.images?.jpg?.image_url && (
                  <img src={item.images.jpg.image_url} alt="Anime Poster" style={{ width: '150px' }} />
                )}
                {item.synopsis && (
                  <p><strong>Synopsis:</strong> {item.synopsis}</p>
                )}

                <button onClick={() => handleAddToMyList(item.mal_id)}>Add to My List</button>
                <button style={{ marginLeft: '0.5em' }} onClick={() => handleViewDetails(item)}>
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
