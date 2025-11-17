import React, { useState, useContext, useCallback } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';

import { AuthContext } from '../context/AuthContext';
import { RecommendationsContext } from '../context/RecommendationsContext';
import { useAnimeList } from '../context/AnimeListContext';

import AnimeCard from '../components/AnimeCard';
import useAutoMessageClear from '../hooks/useAutoMessageClear';
import { handleAddToList } from '../utils/handleAddToList';
import { handleViewDetails } from '../utils/handleViewDetails';

import { useNavigate } from 'react-router-dom';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Retry utility
const fetchWithRetry = async (id, retries = 4, delayMs = 1500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
      return res.data.data;
    } catch (err) {
      if (attempt === retries) return null;
      await delay(delayMs * Math.pow(2, attempt - 1));
    }
  }
};

// Batch requests
const fetchInBatches = async (ids, batchSize = 5, delayMs = 1500) => {
  const results = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const res = await Promise.all(batch.map((id) => fetchWithRetry(id)));
    results.push(...res.filter(Boolean));
    await delay(delayMs);
  }

  return results;
};

const Recommendations = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { recommendations, setRecommendations } = useContext(RecommendationsContext);
  const { setRecords } = useAnimeList();

  const [safeSearch, setSafeSearch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  useAutoMessageClear(messages, setMessages);

  // Main fetch handler
  const fetchRecommendations = useCallback(async () => {
    if (!user?.userId || cooldown) return;

    const controller = new AbortController();
    setLoading(true);
    setError('');
    setCooldown(true);

    try {
      const res = await axiosInstance.get('/recs/me', {
        params: { safeSearch },
        signal: controller.signal
      });

      const ids = res.data.map((item) => item.mal_id);

      const detailResults = await fetchInBatches(ids, 5);
      setRecommendations(detailResults);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError('Failed to load recommendations.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setCooldown(false), 30000);
    }

    return () => controller.abort();
  }, [user, safeSearch, cooldown, setRecommendations]);

  return (
    <div className="bg-[#1A2025] min-h-screen text-white px-5 py-10">
      <h1 className="text-3xl mb-6 border-b-2 border-gray-600 pb-2">Recommendations</h1>

      <button
        onClick={fetchRecommendations}
        disabled={loading || cooldown}
        className="bg-[#36454F] px-4 py-2 rounded-md disabled:opacity-50 hover:bg-[#2c3a43] transition mb-6"
      >
        {loading
          ? 'Loading...'
          : cooldown
          ? 'On Cooldown...'
          : recommendations.length > 0
          ? 'Regenerate Recommendations'
          : 'Generate Recommendations'}
      </button>

      <label className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          checked={safeSearch}
          onChange={() => setSafeSearch(!safeSearch)}
        />
        <span>Enable Safe Search</span>
      </label>

      <p className='my-5'>
        <strong>Notice: </strong>recommendations can only be generated
            for users with anime lists containing atleast one anime in the recommendation system training data
            - newer anime (post 2023) may not qualify.
      </p>

      {loading && <p>Loading recommendations...</p>}
      {error && <p className="text-[#FF5252]">{error}</p>}

      {!loading && recommendations.length === 0 && (
        <p>No recommendations yet. Click above to generate some!</p>
      )}

      <ul className="grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
        {recommendations.map((anime) => (
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
    </div>
  );
};

export default Recommendations;
