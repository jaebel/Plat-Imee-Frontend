import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAnimeList } from '../context/AnimeListContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';
import AnimeCard from '../components/AnimeCard';
import useAutoMessageClear from '../hooks/useAutoMessageClear';

// Fallback data shown if Jikan is unreachable after retries.
// Keeps the search page functional (e.g. for demos) even during API outages.
const FALLBACK_ANIME = [
  {
    mal_id: 16498,
    title: 'Shingeki no Kyojin',
    title_english: 'Attack on Titan',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg' } },
    synopsis: 'Humanity fights for survival against giant humanoid Titans behind massive walls.',
    type: 'TV',
    aired: { string: 'Apr 2013 to Sep 2013' },
    score: 8.5,
  },
  {
    mal_id: 1535,
    title: 'Death Note',
    title_english: 'Death Note',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg' } },
    synopsis: 'A high school student gains the power to kill anyone by writing their name in a mysterious notebook.',
    type: 'TV',
    aired: { string: 'Oct 2006 to Jun 2007' },
    score: 8.6,
  },
  {
    mal_id: 5114,
    title: 'Hagane no Renkinjutsushi: Fullmetal Alchemist Brotherhood',
    title_english: 'Fullmetal Alchemist: Brotherhood',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg' } },
    synopsis: 'Two brothers use alchemy in their attempt to restore their bodies after a failed ritual.',
    type: 'TV',
    aired: { string: 'Apr 2009 to Jul 2010' },
    score: 9.1,
  },
  {
    mal_id: 1,
    title: 'Cowboy Bebop',
    title_english: 'Cowboy Bebop',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg' } },
    synopsis: 'A ragtag crew of bounty hunters chase criminals across the solar system.',
    type: 'TV',
    aired: { string: 'Apr 1998 to Apr 1999' },
    score: 8.75,
  },
  {
    mal_id: 20,
    title: 'Naruto',
    title_english: 'Naruto',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg' } },
    synopsis: 'A young ninja seeks recognition and dreams of becoming leader of his village.',
    type: 'TV',
    aired: { string: 'Oct 2002 to Feb 2007' },
    score: 7.99,
  },
  {
    mal_id: 21,
    title: 'One Piece',
    title_english: 'One Piece',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg' } },
    synopsis: 'A young pirate searches for the ultimate treasure to become the next Pirate King.',
    type: 'TV',
    aired: { string: 'Oct 1999 to present' },
    score: 8.7,
  },
  {
    mal_id: 11061,
    title: 'Hunter x Hunter (2011)',
    title_english: 'Hunter x Hunter',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg' } },
    synopsis: 'A young boy sets out to become a Hunter and find his estranged father.',
    type: 'TV',
    aired: { string: 'Oct 2011 to Sep 2014' },
    score: 9.04,
  },
  {
    mal_id: 30276,
    title: 'One Punch Man',
    title_english: 'One Punch Man',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/12/76049.jpg' } },
    synopsis: 'A hero who can defeat any opponent with a single punch searches for a worthy challenge.',
    type: 'TV',
    aired: { string: 'Oct 2015 to Dec 2015' },
    score: 8.5,
  },
  {
    mal_id: 38000,
    title: 'Kimetsu no Yaiba',
    title_english: 'Demon Slayer',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg' } },
    synopsis: 'A boy becomes a demon slayer to save his sister and avenge his family.',
    type: 'TV',
    aired: { string: 'Apr 2019 to Sep 2019' },
    score: 8.5,
  },
  {
    mal_id: 40748,
    title: 'Jujutsu Kaisen',
    title_english: 'Jujutsu Kaisen',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg' } },
    synopsis: 'A boy swallows a cursed talisman and becomes host to a powerful curse.',
    type: 'TV',
    aired: { string: 'Oct 2020 to Mar 2021' },
    score: 8.6,
  },
  {
    mal_id: 9253,
    title: 'Steins;Gate',
    title_english: 'Steins;Gate',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/5/73199.jpg' } },
    synopsis: 'A self-proclaimed mad scientist discovers a way to send messages to the past.',
    type: 'TV',
    aired: { string: 'Apr 2011 to Sep 2011' },
    score: 9.07,
  },
  {
    mal_id: 4224,
    title: 'Toradora!',
    title_english: 'Toradora!',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/13/22128.jpg' } },
    synopsis: 'Two students team up to help each other win over their respective crushes.',
    type: 'TV',
    aired: { string: 'Oct 2008 to Mar 2009' },
    score: 8.1,
  },
  {
    mal_id: 32281,
    title: 'Kimi no Na wa.',
    title_english: 'Your Name.',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg' } },
    synopsis: 'Two strangers find themselves mysteriously swapping bodies.',
    type: 'Movie',
    aired: { string: 'Aug 2016' },
    score: 8.85,
  },
  {
    mal_id: 199,
    title: 'Sen to Chihiro no Kamikakushi',
    title_english: 'Spirited Away',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/6/79597.jpg' } },
    synopsis: 'A young girl wanders into a world ruled by gods and witches.',
    type: 'Movie',
    aired: { string: 'Jul 2001' },
    score: 8.75,
  },
  {
    mal_id: 269,
    title: 'Bleach',
    title_english: 'Bleach',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/3/40451.jpg' } },
    synopsis: 'A teenager gains the powers of a Soul Reaper and must defend the living world from evil spirits.',
    type: 'TV',
    aired: { string: 'Oct 2004 to Mar 2012' },
    score: 7.94,
  },
];

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
  const [isFallback, setIsFallback] = useState(false);
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
    setIsFallback(false);

    const fetchWithRetry = async (retries = 1) => {
      try {
        const res = await axios.get(
          `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}`,
          { signal: controller.signal, timeout: 8000 }
        );
        setAnimeList(res.data.data || []);
        setHasNextPage(res.data.pagination?.has_next_page ?? false);
        setLoading(false);
      } catch (err) {
        // Ignore abort errors
        if (err.name === 'CanceledError') return;

        const status = err.response?.status;
        const isTimeoutOrGatewayError =
          err.code === 'ECONNABORTED' || status === 504 || status === 503;

        // Retry once on timeout or gateway errors before giving up
        if (isTimeoutOrGatewayError && retries > 0) {
          await new Promise((r) => setTimeout(r, 1000));
          return fetchWithRetry(retries - 1);
        }

        console.error('Error searching anime:', err);
        console.error('Status:', status);
        console.error('Message:', err.response?.data?.message);

        // Better error messages
        if (status === 429) {
          setError('Rate limit exceeded. Please wait a moment and try again.');
          setLoading(false);
        } else if (status === 404) {
          setError('No results found.');
          setLoading(false);
        } else if (isTimeoutOrGatewayError) {
          // Show fallback results instead of a dead end
          setAnimeList(FALLBACK_ANIME);
          setHasNextPage(false);
          setIsFallback(true);
          setLoading(false);
        } else {
          setError('Failed to fetch upcoming anime. Please try again later.');
          setLoading(false);
        }
      }
    };

    fetchWithRetry();

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
      <h1 className="text-3xl mb-6 border-b-2 border-gray-600 pb-2">
        {isFallback ? 'Popular Anime (Live Search Unavailable)' : `Search Results for "${query}"`}
      </h1>

      {isFallback && (
        <div className="bg-[#2c1f1f] border border-[#5a3a3a] rounded-md p-4 mb-6 text-sm text-gray-300">
          <p className="font-semibold text-[#FF8A80] mb-1">
            Live search is temporarily down
          </p>
          <p>
            {'This app uses Jikan ('}
            <a href="https://jikan.moe" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">jikan.moe</a>
            {'), a free third-party API for anime data. Its search endpoint is currently out of order which is an outage on their end, not this app. Other features of this app are unaffected. Currently showing popular picks below in the meantime.'}
          </p>
        </div>
      )}

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

      {!isFallback && (
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
      )}
    </div>
  );
};

export default SearchAnime;