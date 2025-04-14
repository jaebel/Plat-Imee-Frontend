import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';

const SearchAnime = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const query = params.get('query') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);

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

              <button onClick={() => handleAddToList(item.mal_id, user)}>Add to My List</button>

              <button
                style={{ marginLeft: '0.5em' }}
                onClick={() => handleViewDetails(item, navigate)}
              >
                View Details
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchAnime;
