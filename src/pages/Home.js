import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';
import { AuthContext } from '../context/AuthContext';
import { handleViewDetails } from '../utils/handleViewDetails';

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

  return (
    <div className="home-container">
      <div className="home-heading">
        <h1>Welcome to Plat-Imee</h1>
        <p>Your personal anime discovery and recommendation platform.</p>
      </div>

      <div className="home-buttons">
        <button onClick={() => navigate('/top')} className="home-button">Top Anime</button>
        <button onClick={() => navigate('/genre-picker')} className="home-button">Browse by Genre</button>
        <button onClick={() => navigate('/all-anime')} className="home-button">All Anime</button>
        <button onClick={() => navigate('/upcoming')} className="home-button">Upcoming Anime</button>
      </div>

      <div className="trending-section">
        <div className="trending-header">
          <h2>
            <span className="trending-link" onClick={() => navigate('/seasonal')}>Trending This Season</span>
          </h2>
        </div>
        <div className="trending-anime-list">
          {seasonalAnime.map(anime => (
            <div key={anime.mal_id} className="anime-card">
              <img
                src={anime.images?.jpg?.image_url}
                alt={anime.title}
                className="anime-image"
                onClick={() => handleViewDetails(anime, navigate)}
                style={{ cursor: 'pointer' }}
              />
              <p
                className="anime-title"
                onClick={() => handleViewDetails(anime, navigate)}
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
