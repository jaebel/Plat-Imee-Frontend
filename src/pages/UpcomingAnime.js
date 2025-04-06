import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

// Some optional helper to map Jikan's type string to the backend enum (TV, MOVIE, etc.)
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

const UpcomingAnime = () => {
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  // Fetch upcoming anime from Jikan when the component mounts
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
              <h2>{item.title_english || item.title}</h2>
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
      )}

      <div style={{ marginTop: '2em' }}>
        <Link to="/anime">View All Anime (Local)</Link>
      </div>
    </div>
  );
};

export default UpcomingAnime;
