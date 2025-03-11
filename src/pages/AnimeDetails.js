import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const AnimeDetails = () => {
  // Retrieve the anime id from the URL (this is now the MAL ID)
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonText, setButtonText] = useState('Add to My List');

  // Pull the user from AuthContext, so we can get the correct userId
  const { user } = useContext(AuthContext);

  useEffect(() => {
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

  const handleAddToList = async () => {
    try {
      if (!user || !user.userId) {
        setButtonText('Not logged in');
        return;
      }
      // Make a POST request with the correct userId and MAL ID (malId)
      await axiosInstance.post('/user-anime', {
        userId: user.userId,
        malId: anime.malId  // Use malId instead of animeId
      });
      setButtonText('Added');
    } catch (error) {
      console.error('Error adding anime:', error);
      setButtonText('Error');
    }
  };

  if (loading) return <div>Loading anime details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!anime) return <div>No anime found.</div>;

  return (
    <div>
      <h1>{anime.name}</h1>
      <p>Type: {anime.type}</p>
      <p>Score: {anime.score}</p>
      <p>Episodes: {anime.episodes}</p>
      <p>Genres: {anime.genres.join(", ")}</p>
      <p>Aired: {anime.aired}</p>
      <p>Premiered: {anime.premiered}</p>
      {anime.englishName && <p>English Name: {anime.englishName}</p>}
      {anime.japaneseName && <p>Japanese Name: {anime.japaneseName}</p>}

      <button onClick={handleAddToList}>{buttonText}</button>

      <Link to="/anime" style={{ marginTop: '20px', display: 'inline-block' }}>
        Back to Anime List
      </Link>
    </div>
  );
};

export default AnimeDetails;
