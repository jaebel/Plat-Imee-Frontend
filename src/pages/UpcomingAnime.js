import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAnimeList } from '../context/AnimeListContext';
import { handleViewDetails } from '../utils/handleViewDetails';
import { handleAddToList } from '../utils/handleAddToList';

const truncate = (text, max) =>
  text && text.length > max ? text.slice(0, max) + "..." : text;

const UpcomingAnime = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { setRecords } = useAnimeList();

  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get('page') || '1', 10);

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState({});

  const timersRef = useRef({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    setLoading(true);
    setError('');
    axios
      .get(`https://api.jikan.moe/v4/seasons/upcoming?page=${page}`)
      .then((res) => {
        setAnimeList(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching upcoming anime:', err);
        setError('Failed to fetch upcoming anime.');
        setLoading(false);
      });
  }, [page]);

  // Auto-clear messages after 3s
  useEffect(() => {
    // Cleanup timers for messages that were removed externally (this is just incase)
    Object.keys(timersRef.current).forEach((id) => {
      if (!messages[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    });

    // Set new timers for messages that don't have one yet (and handle deletion of messages and timers after 3 seconds)
    Object.keys(messages).forEach((id) => {
      if (!timersRef.current[id]) {
        timersRef.current[id] = setTimeout(() => {
          setMessages((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
          delete timersRef.current[id];
        }, 3000);
      }
    });

    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    };
  }, [messages]);

  return (
    <div className="bg-[#1A2025] text-white px-5 py-10">
      <h1 className="text-3xl mb-6 border-b-2 border-gray-600 pb-2">Upcoming Anime</h1>

      {loading && <p>Loading upcoming anime...</p>}
      {error && <p className="text-[#FF5252]">{error}</p>}

      {animeList.length === 0 ? (
        <p>No upcoming anime found.</p>
      ) : (
        <ul className="grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
          {animeList.map((item) => (
            <li
              key={item.mal_id}
              className="flex flex-row gap-4 p-4 border border-[#333] rounded-md bg-[#36454F] overflow-hidden transition-all duration-300 ease"
            >
              {/* Image Section */}
              <div className="flex-shrink-0 w-[140px] sm:w-[160px]">
                <img
                  src={item.images?.jpg?.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover rounded transition-transform duration-200 hover:scale-105"
                />
              </div>

              {/* Content Section */}
              <div className="flex flex-col justify-between flex-grow min-w-0 self-stretch">
                <div className="flex-grow">
                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2">
                    {item.title_english || item.title}
                  </h2>

                  {/* Synopsis */}
                  <p className="text-gray-300 text-sm mb-2 hidden md:block line-clamp-2">
                    <strong>Synopsis:</strong> {truncate(item.synopsis, 80)}
                  </p>

                  {/* Details */}
                  <div className="text-gray-300 text-xs sm:text-sm space-y-1 mb-2">
                    <p className="truncate">
                      <strong>Type:</strong> {item.type || 'TV'}
                    </p>
                    <p className="truncate hidden sm:block">
                      <strong>Aired:</strong> {item.aired?.string || 'Unknown'}
                    </p>
                    <p>
                      <strong>Rating:</strong> {item.score ?? 'N/A'}
                    </p>
                  </div>

                  {/* Reserved message space */}
                  <div className="min-h-[20px] mb-2">
                    {messages[item.mal_id] && (
                      <p
                        className={`text-xs sm:text-sm truncate ${
                          messages[item.mal_id].includes('added')
                            ? 'text-[#00E676]'
                            : 'text-[#FF5252]'
                        }`}
                      >
                        {messages[item.mal_id]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Button Section - At bottom */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() =>
                      handleAddToList(item.mal_id, user, setMessages, setRecords)
                    }
                    className="w-full bg-[#a18787] hover:bg-[#5e4e4e] text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-md font-medium text-xs sm:text-sm shadow transition"
                  >
                    Add to List
                  </button>

                  <button
                    onClick={() => handleViewDetails(item, navigate)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-md font-medium text-xs sm:text-sm shadow transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

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

export default UpcomingAnime;