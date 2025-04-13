import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';

const Home = () => {
  const [seasonalAnime, setSeasonalAnime] = useState([]);

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
        <Link to="/top" className="home-button">
          Top Anime
        </Link>

        <Link to="/browse-genre" className="home-button">
          Browse by Genre
        </Link>

        <Link to="/all-anime" className="home-button">
          All Anime
        </Link>

        <Link to="/upcoming" className="home-button">
          Upcoming Anime
        </Link>
      </div>

      <div className="trending-section">
        <div className="trending-header">
          <h2><Link to="/seasonal">Trending This Season</Link></h2>
        </div>
        <div className="trending-anime-list">
          {seasonalAnime.map(anime => (
            <div key={anime.mal_id} className="anime-card">
              {anime.images?.jpg?.image_url && (
                <img src={anime.images.jpg.image_url} alt={anime.title} className="anime-image" />
              )}
              <p className="anime-title">{anime.title_english || anime.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
