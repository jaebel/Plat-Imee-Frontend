import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useAnimeList } from '../context/AnimeListContext';
import JikanService from '../services/JikanService';
import { handleAddToList } from '../utils/handleAddToList';
import '../styles/AnimeDetails.css';

const AnimeDetails = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [jikanData, setJikanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonText, setButtonText] = useState('Add to My List');
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const { user } = useContext(AuthContext);
  const { setRecords } = useAnimeList(); // ✅ get cache resetter

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

  const handleAdd = async () => {
    if (!anime) return;
    if (!user || !user.userId) {
      setShowLoginMessage(true);
      return;
    }

    try {
      await handleAddToList(anime.malId, user, () => {}, setRecords); // ✅ pass setRecords
      setButtonText('Added');
    } catch (err) {
      setButtonText('Error');
    }
  };

  if (loading) return <div>Loading anime details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!anime) return <div>No anime found.</div>;

  return (
    <div className="anime-details-container">
      <h1>{anime.name}</h1>
      <div className="anime-details-meta">
        <p><strong>Type:</strong> {anime.type}</p>
        <p><strong>Score:</strong> {anime.score}</p>
        <p><strong>Episodes:</strong> {anime.episodes}</p>
        <p><strong>Genres:</strong> {anime.genres.join(", ")}</p>
        <p><strong>Aired:</strong> {anime.aired}</p>
        <p><strong>Premiered:</strong> {anime.premiered}</p>
        {anime.englishName && <p><strong>English Name:</strong> {anime.englishName}</p>}
        {anime.japaneseName && <p><strong>Japanese Name:</strong> {anime.japaneseName}</p>}
      </div>

      {jikanData && (
        <div>
          <h2>Additional Info from Jikan</h2>
          {jikanData.images?.jpg?.image_url && (
            <img src={jikanData.images.jpg.image_url} alt="Anime" className="anime-details-image" />
          )}
          <p className="anime-details-synopsis"><strong>Synopsis:</strong> {jikanData.synopsis}</p>
        </div>
      )}

      {showLoginMessage && (
        <p className="anime-details-login-warning">
          You must be logged in to add anime to your list.
        </p>
      )}

      <button onClick={handleAdd} className="anime-details-add-btn">{buttonText}</button>
    </div>
  );
};

export default AnimeDetails;
