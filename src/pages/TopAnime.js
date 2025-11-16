import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAnimeList } from '../context/AnimeListContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import AnimeCard from '../components/AnimeCard';
import useAutoMessageClear from '../hooks/useAutoMessageClear';

const TopAnime = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { setRecords } = useAnimeList();

  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get('page') || '1', 10);

  const [topAnime, setTopAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  // Auto-clear messages after 3 seconds
  useAutoMessageClear(messages, setMessages);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  useEffect(() => {
    const controller = new AbortController();
    
    setLoading(true);
    setError('');

    axios
      .get(`https://api.jikan.moe/v4/top/anime?page=${page}`, {
        signal: controller.signal
      })
      .then(res => {
        setTopAnime(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        // Ignore abort errors
        if (err.name === 'CanceledError') return;
        
        console.error('Error fetching top anime:', err);
        console.error('Status:', err.response?.status);
        console.error('Message:', err.response?.data?.message);
        
        // Better error messages
        if (err.response?.status === 429) {
          setError('Rate limit exceeded. Please wait a moment and try again.');
        } else if (err.response?.status === 404) {
          setError('Page not found.');
        } else {
          setError('Failed to fetch top anime. Please try again later.');
        }
        
        setLoading(false);
      });
    
    // Cleanup: cancel the request if component unmounts or dependencies change
    return () => controller.abort();
  }, [page]);

  return (
    <div className="bg-[#1A2025] text-white px-5 py-10">
      <h1 className="text-3xl mb-6 border-b-2 border-gray-600 pb-2">Top Anime</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-[#FF5252]">{error}</p>}

      <ul className="grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
        {topAnime.map((anime, index) => (
          <li key={anime.mal_id} className="relative">
            {/* Rank Badge */}
            <div className="absolute top-2 left-2 bg-blue-600 text-white font-bold text-sm px-3 py-1 rounded-full z-10 shadow-lg">
              #{(page - 1) * 25 + index + 1}
            </div>

            <AnimeCard
              anime={anime}
              message={messages[anime.mal_id]}
              onAddToList={() =>
                handleAddToList(anime.mal_id, user, setMessages, setRecords)
              }
              onViewDetails={() => handleViewDetails(anime, navigate)}
            />
          </li>
        ))}
      </ul>

      <div className="mt-10 flex justify-center items-center gap-4">
        <button
          onClick={() => navigate(`?page=${page - 1}`)}
          disabled={page === 1}
          className="bg-[#36454F] px-4 py-2 rounded-md disabled:opacity-50 hover:bg-[#2c3a43] transition"
        >
          Previous
        </button>

        <span className="font-bold">Page {page}</span>

        <button
          onClick={() => navigate(`?page=${page + 1}`)}
          className="bg-[#36454F] px-4 py-2 rounded-md hover:bg-[#2c3a43] transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TopAnime;