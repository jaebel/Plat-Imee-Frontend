import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import JikanService from '../services/JikanService';

const AnimeDetails = () => {
  // Retrieve the anime id from the URL (this is now the MAL ID)
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [jikanData, setJikanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonText, setButtonText] = useState('Add to My List');
  const [showLoginMessage, setShowLoginMessage] = useState(false);

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

  // Fetch additional details from Jikan using the MAL ID without affecting existing code.
  useEffect(() => {
    if (anime && anime.malId) {
      JikanService.getAnimeDetails(anime.malId)
        .then(data => {
          setJikanData(data);
        })
        .catch(err => {
          console.error('Error fetching external data from Jikan:', err);
        });
    }
  }, [anime]);

  const handleAddToList = async () => {
    if (!user || !user.userId) {
      setShowLoginMessage(true);
      return;
    }

    try {
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

      {/* Display additional details from Jikan if available */}
      {jikanData && (
        <div>
          <h2>Additional Info from Jikan</h2>
          {jikanData.images && jikanData.images.jpg && (
            <img src={jikanData.images.jpg.image_url} alt="Anime" style={{ width: '200px' }} />
          )}
          <p><strong>Synopsis:</strong> {jikanData.synopsis}</p>
        </div>
      )}

      {showLoginMessage && (
        <p style={{ color: 'red', marginBottom: '10px' }}>
          You must be logged in to add anime to your list.
        </p>
      )}

      <button onClick={handleAddToList}>{buttonText}</button>
    </div>
  );
};

export default AnimeDetails;
