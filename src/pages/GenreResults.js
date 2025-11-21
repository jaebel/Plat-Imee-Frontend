import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAnimeList } from '../context/AnimeListContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import AnimeCard from '../components/AnimeCard';
import useAutoMessageClear from '../hooks/useAutoMessageClear';

const GenreResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { setRecords } = useAnimeList();

  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get('page') || '1', 10);
  const genres = params.get('genres');

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  // Auto-clear messages after 3 seconds
  useAutoMessageClear(messages, setMessages);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page, genres]);

  useEffect(() => {
    if (!genres) {
      console.warn('No genres parameter found - exiting early.');
      setError('No genre selected. Please select a genre first.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    // Reset state when the page changes
    setAnimeList([]);
    setLoading(true);
    setError('');

    const url = `https://api.jikan.moe/v4/anime?genres=${genres}&page=${page}`;

    axios
      .get(url, { signal: controller.signal })
      .then(res => {
        setAnimeList(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        // Request was canceled -> ignore
        if (err.name === 'CanceledError') return;

        console.error('Error fetching genre results:', err);
        console.error('Status:', err.response?.status);
        console.error('Message:', err.response?.data?.message);

        // Better error messages
        if (err.response?.status === 429) {
          setError('Rate limit exceeded. Please wait a moment and try again.');
        } else if (err.response?.status === 404) {
          setError('No results found.');
        } else {
          setError('Failed to load results. Please try again later.');
        }

        setLoading(false);
      });

    // Cleanup: cancel the request if component unmounts or dependencies change  
    return () => controller.abort();
  }, [page, genres]);

  return (
    <div className="bg-[#1A2025] text-white px-5 py-10">
      <h1 className="text-3xl mb-6 border-b-2 border-gray-600 pb-2">
        Genre Results
      </h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-[#FF5252]">{error}</p>}

      <ul className="grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
        {animeList.map(anime => (
          <AnimeCard
            key={anime.mal_id}
            anime={anime}
            message={messages[anime.mal_id]}
            onAddToList={() =>
              handleAddToList(anime.mal_id, user, setMessages, setRecords)
            }
            onViewDetails={() => handleViewDetails(anime, navigate)}
          />
        ))}
      </ul>

      <div className="mt-10 flex justify-center items-center gap-4">
        <button
          onClick={() => {
            navigate(`?genres=${genres}&page=${page - 1}`);
          }}
          disabled={page === 1}
          className="bg-[#36454F] px-4 py-2 rounded-md disabled:opacity-50 hover:bg-[#2c3a43] transition"
        >
          Previous
        </button>

        <span className="font-bold">Page {page}</span>

        <button
          onClick={() => {
            navigate(`?genres=${genres}&page=${page + 1}`);
          }}
          className="bg-[#36454F] px-4 py-2 rounded-md hover:bg-[#2c3a43] transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GenreResults;
