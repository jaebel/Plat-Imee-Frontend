import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

/**
 * Optional helper to map Jikan's "type" string to your AnimeType enum strings:
 *  TV, MOVIE, OVA, ONA, SPECIAL
 */
function mapJikanType(jikanType) {
  if (!jikanType) return "TV"; // fallback if missing
  const upper = jikanType.toUpperCase();
  switch (upper) {
    case "TV":
    case "MOVIE":
    case "OVA":
    case "ONA":
    case "SPECIAL":
      return upper;
    default:
      return "TV"; // or "UNKNOWN" if your enum supports it
  }
}

/**
 * SearchAnime - displays search results from Jikan for the user's query
 * Allows the user to "Add to My List" or "View Details."
 * When viewing details of a non-local anime, we create a minimal record
 */
const SearchAnime = () => {
  // Read the search query from the URL (e.g., /search?query=naruto)
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const query = params.get('query') || '';

  // Local states for results, loading, error
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Access user from AuthContext for "Add to My List"
  const { user } = useContext(AuthContext);

  // Fetch search results from Jikan whenever 'query' changes
  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');

    axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`)
      .then(res => {
        setResults(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error searching anime:', err);
        setError('Error searching anime.');
        setLoading(false);
      });
  }, [query]);

  /**
   * handleAddToMyList - user clicks "Add" to post to /user-anime with malId
   */
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

  /**
   * handleViewDetails - user clicks "View Details"
   * 1) Check if local DB has the anime by malId (GET /anime/{malId})
   * 2) If 404, create a minimal record with mandatory fields from Jikan
   * 3) Redirect to /anime/{malId}
   */
  const handleViewDetails = async (item) => {
    const malId = item.mal_id;
    try {
      // Check if anime exists locally
      await axiosInstance.get(`/anime/${malId}`);
      // If no error, it already exists
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Not found locally, so create it
        try {
          // We map Jikan's fields to the required AnimeCreateDTO fields
          // "type" must be non-null, so we convert Jikan's type to your enum-compatible string
          // "genres" must be non-null, so pass an empty list or map them if you can
          const jikanType = mapJikanType(item.type);
          const minimalGenres = []; // or map Jikan's genres if you prefer

          const payload = {
            malId: malId,
            name: item.title_english || item.title,
            type: jikanType,
            episodes: item.episodes || 1,  // fallback if missing
            score: item.score || 0.0,      // fallback if missing
            aired: item.aired?.string || "",
            premiered: item.season || "",
            // If your AnimeCreateDTO has "members", you can pass item.members if available
            // or fallback to 0, e.g. "members: item.members || 0,"
            genres: minimalGenres         // must not be null
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
    // Now navigate to the local details page
    navigate(`/anime/${malId}`);
  };

  // If no query, show a simple message
  if (!query.trim()) {
    return <div style={{ padding: '1em' }}>No search term provided.</div>;
  }

  if (loading) {
    return <div style={{ padding: '1em' }}>Searching for "{query}"...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '1em' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '1em' }}>
      <h1>Search Results for "{query}"</h1>
      {results.length === 0 ? (
        <p>No anime found.</p>
      ) : (
        <ul>
          {results.map(item => (
            <li
              key={item.mal_id}
              style={{ marginBottom: '1em', borderBottom: '1px solid #ccc', paddingBottom: '1em' }}
            >
              <h2>{item.title_english || item.title}</h2>
              {item.images?.jpg?.image_url && (
                <img src={item.images.jpg.image_url} alt="Anime Poster" style={{ width: '150px' }} />
              )}
              {item.synopsis && (
                <p><strong>Synopsis:</strong> {item.synopsis}</p>
              )}

              {/* Add to My List calls your /user-anime endpoint */}
              <button onClick={() => handleAddToMyList(item.mal_id)}>
                Add to My List
              </button>

              {/* View Details attempts to create a local record if needed, then navigates */}
              <button
                style={{ marginLeft: '0.5em' }}
                onClick={() => handleViewDetails(item)}
              >
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

export default SearchAnime;
