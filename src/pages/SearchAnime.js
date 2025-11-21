import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAnimeList } from '../context/AnimeListContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import AnimeCard from '../components/AnimeCard';
import useAutoMessageClear from '../hooks/useAutoMessageClear';

const SearchAnime = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { setRecords } = useAnimeList();

  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get('page') || '1', 10);
  const query = params.get('query') || '';

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});
  const [hasNextPage, setHasNextPage] = useState(true);

    // Auto-clear messages after 3 seconds
  useAutoMessageClear(messages, setMessages);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  useEffect(() => {
    const controller = new AbortController();
    if (!query.trim()) return;
    setLoading(true);
    setError('');

    axios
    .get(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}`,
      { signal: controller.signal }
    )
    .then(res => {
      setAnimeList(res.data.data || []);
      setHasNextPage(res.data.pagination?.has_next_page ?? false);
      setLoading(false);
    })
    .catch((err) => {
        // Ignore abort errors
        if (err.name === 'CanceledError') return;
        
        console.error('Error searching anime:', err);
        console.error('Status:', err.response?.status);
        console.error('Message:', err.response?.data?.message);
        
        // Better error messages
        if (err.response?.status === 429) {
          setError('Rate limit exceeded. Please wait a moment and try again.');
        } else if (err.response?.status === 404) {
          setError('No results found.');
        } else {
          setError('Failed to fetch upcoming anime. Please try again later.');
        }
        
        setLoading(false);
      });
    
    // Cleanup: cancel the request if component unmounts or dependencies change
    return () => controller.abort();
  }, [page, query]);

  if (!query.trim()) {
    return <div className="top-anime-container">No search term provided.</div>;
  }

  if (loading) {
    return <div className="top-anime-container">Searching for "{query}"...</div>;
  }

  if (error) {
    return <div className="top-anime-container error">{error}</div>;
  }

  return (
    <div className="bg-[#1A2025] text-white px-5 py-10">
      <h1 className="text-3xl mb-6 border-b-2 border-gray-600 pb-2">Search Results for "{query}"</h1>

      {loading && <p>Loading upcoming anime...</p>}
      {error && <p className="text-[#FF5252]">{error}</p>}

      {animeList.length === 0 ? (
        <p>No anime found.</p>
      ) : (
        <ul className="grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
          {animeList.map((item) => (
            <AnimeCard
              key={item.mal_id}
              anime={item}
              message={messages[item.mal_id]}
              onAddToList={() =>
                handleAddToList(item.mal_id, user, setMessages, setRecords)
              }
              onViewDetails={() => handleViewDetails(item, navigate)}
            />
          ))}
        </ul>
      )}

      <div className="mt-10 flex justify-center items-center gap-4">
        <button
          onClick={() => navigate(`?query=${query}&page=${page - 1}`)}
          disabled={page === 1}
          className="bg-[#36454F] px-4 py-2 rounded-md disabled:opacity-50 hover:bg-[#2c3a43] transition"
        >
          Previous
        </button>
        <span className="font-bold">Page {page}</span>
        <button
          onClick={() => navigate(`?query=${query}&page=${page + 1}`)}
          disabled={!hasNextPage}
          className="bg-[#36454F] px-4 py-2 rounded-md hover:bg-[#2c3a43] transition disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SearchAnime;
