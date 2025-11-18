import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useAnimeList } from '../context/AnimeListContext';
import JikanService from '../services/JikanService';
import { handleAddToList } from '../utils/handleAddToList';

const AnimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [jikanData, setJikanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const { user } = useContext(AuthContext);
  const { setRecords } = useAnimeList();

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
      setMessage('You must be logged in to add anime to your list.');
      setMessageType('error');
      return;
    }

    try {
      await handleAddToList(anime.malId, user, () => {}, setRecords);
      setMessage('Anime added to your list!');
      setMessageType('success');
    } catch (err) {
      setMessage('Failed to add anime to your list.');
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2025] flex justify-center items-start pt-20">
        <div className="text-white text-lg">Loading anime details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a2025] flex justify-center items-start pt-20">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#1a2025] flex justify-center items-start pt-20">
        <div className="text-white text-lg">No anime found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2025] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-[#36454F] text-white rounded-md hover:bg-[#2c3a43] transition"
        >
          ← Back
        </button>

        {/* Main Content Card */}
        <div className="bg-[#36454F] rounded-lg shadow-md p-6 text-white">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Image */}
            {jikanData?.images?.jpg?.image_url && (
              <div className="flex-shrink-0">
                <img
                  src={jikanData.images.jpg.image_url}
                  alt={anime.name}
                  className="w-full md:w-64 h-auto rounded-lg shadow-lg object-cover"
                />
              </div>
            )}

            {/* Title and Synopsis */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-4 border-b border-gray-500 pb-3">
                {anime.name}
              </h1>

              {jikanData?.synopsis && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {jikanData.synopsis}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="mb-6">
            <hr className='mb-3'/>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {anime.englishName && (
                <p className="text-gray-300">
                  <strong className="text-white">English:</strong> {anime.englishName}
                </p>
              )}
              {anime.japaneseName && (
                <p className="text-gray-300">
                  <strong className="text-white">Japanese:</strong> {anime.japaneseName}
                </p>
              )}
              <p className="text-gray-300">
                <strong className="text-white">Type:</strong> {anime.type}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Score:</strong> {anime.score}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Episodes:</strong> {anime.episodes}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Aired:</strong> {anime.aired}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Premiered:</strong> {anime.premiered}
              </p>
              <p className="text-gray-300 sm:col-span-2">
                <strong className="text-white">Genres:</strong> {anime.genres.join(", ")}
              </p>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-md text-center text-sm ${
                messageType === 'success'
                  ? 'bg-[#00E676]/10 text-[#00E676]'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleAdd}
            className="w-full sm:w-auto px-6 py-3 bg-[#4caf50] rounded-md hover:bg-[#45a049] transition-colors font-medium"
          >
            Add to My List
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;