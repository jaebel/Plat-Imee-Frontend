import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const AnimeDetails = () => {
  // Retrieve the anime id from the URL (e.g., /anime/123)
  const { id } = useParams();

  // Local state for the anime details, loading, and error message
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the anime details using the provided id
    axiosInstance.get(`/anime/${id}`)
      .then(response => {
        setAnime(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching anime details.');
        setLoading(false);
      });
  }, [id]);

  // While waiting for the response, show a loading message
  if (loading) return <div>Loading anime details...</div>;

  // If there was an error, display it
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  // If anime data is not found, display a message
  if (!anime) return <div>No anime found.</div>;

  return (
    <div>
      {/* Display basic anime information */}
      <h1>{anime.name}</h1>
      <p>Type: {anime.type}</p>
      <p>Score: {anime.score}</p>
      <p>Episodes: {anime.episodes}</p>
      <p>Genres: {anime.genres.join(", ")}</p>
      <p>Aired: {anime.aired}</p>
      <p>Premiered: {anime.premiered}</p>
      
      {/* Optionally display alternate names if available */}
      {anime.englishName && <p>English Name: {anime.englishName}</p>}
      {anime.japaneseName && <p>Japanese Name: {anime.japaneseName}</p>}
      
      {/* "Back to List" link to navigate back to the Anime List page */}
      <Link to="/anime" style={{ marginTop: '20px', display: 'inline-block' }}>
        Back to Anime List
      </Link>
    </div>
  );
};

export default AnimeDetails;
