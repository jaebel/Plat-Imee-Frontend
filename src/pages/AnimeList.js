import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

const AnimeList = () => {
  // State to hold the list of anime, loading and error status
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect to fetch the anime data when the component mounts
  useEffect(() => {
    // Fetch all anime using the backend endpoint
    axiosInstance.get('/anime')
      .then(response => {
        setAnimeList(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching anime data.');
        setLoading(false);
      });
  }, []);

  // Display a loading message while data is being fetched
  if (loading) return <div>Loading anime...</div>;
  // Display an error message if fetching fails
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Anime List</h1>
      <ul>
        {animeList.map(anime => (
          <li key={anime.animeId}>
            {/* Wrap anime name in Link so users can navigate to details page */}
            <Link to={`/anime/${anime.animeId}`}>
              <h2>{anime.name}</h2>
            </Link>
            <p>Type: {anime.type}</p>
            <p>Score: {anime.score}</p>
            <p>Episodes: {anime.episodes}</p>
            <p>Genres: {anime.genres.join(", ")}</p>
            <p>Aired: {anime.aired}</p>
            <p>Premiered: {anime.premiered}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnimeList;
