import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import '../styles/Home.css';
import { AuthContext } from '../context/AuthContext';

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

const Home = () => {
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    axios.get('https://api.jikan.moe/v4/seasons/now')
      .then(res => {
        setSeasonalAnime(res.data.data.slice(0, 6));
      })
      .catch(err => console.error('Failed to fetch seasonal anime:', err));
  }, []);

  const handleViewDetails = async (anime) => {
    const malId = anime.mal_id;
    try {
      await axiosInstance.get(`/anime/${malId}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          const jikanType = mapJikanType(anime.type);
          const minimalGenres = [];

          const payload = {
            malId: malId,
            name: anime.title_english || anime.title,
            type: jikanType,
            episodes: anime.episodes || 1,
            score: anime.score || 0.0,
            aired: anime.aired?.string || "",
            premiered: anime.season || "",
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
    <div className="home-container">
      <div className="home-heading">
        <h1>Welcome to Plat-Imee</h1>
        <p>Your personal anime discovery and recommendation platform.</p>
      </div>

      <div className="home-buttons">
        <button onClick={() => navigate('/top')} className="home-button">Top Anime</button>
        <button onClick={() => navigate('/browse-genre')} className="home-button">Browse by Genre</button>
        <button onClick={() => navigate('/all-anime')} className="home-button">All Anime</button>
        <button onClick={() => navigate('/upcoming')} className="home-button">Upcoming Anime</button>
      </div>

      <div className="trending-section">
        <div className="trending-header">
          <h2><button onClick={() => navigate('/seasonal')} className="trending-link">Trending This Season</button></h2>
        </div>
        <div className="trending-anime-list">
          {seasonalAnime.map(anime => (
            <div key={anime.mal_id} className="anime-card">
              <img
                src={anime.images?.jpg?.image_url}
                alt={anime.title}
                className="anime-image"
                onClick={() => handleViewDetails(anime)}
                style={{ cursor: 'pointer' }}
              />
              <p
                className="anime-title"
                onClick={() => handleViewDetails(anime)}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
              >
                {anime.title_english || anime.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
