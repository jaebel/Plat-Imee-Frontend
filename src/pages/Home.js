import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleViewDetails } from '../utils/handleViewDetails';

const Home = () => {
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://api.jikan.moe/v4/seasons/now')
      .then(res => setSeasonalAnime(res.data.data.slice(0, 6)))
      .catch(err => console.error('Failed to fetch seasonal anime:', err));
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 p-8 text-center bg-[#DEB8B8] min-h-screen font-semibold">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Plat-Imee</h1>
        <p className="text-lg text-[#36454F]">Your personal anime discovery and recommendation platform.</p>
      </div>

      {/* Navigation buttons - I'm not putting the styles in a component because i'm using it just once */}
      <div
        className="
          flex flex-wrap justify-center gap-8
          [&>button]:px-8 [&>button]:py-4
          [&>button]:bg-[#333] [&>button]:text-white
          [&>button]:text-lg [&>button]:rounded-lg
          [&>button]:min-w-[180px]
          [&>button:hover]:bg-[#444]
          [&>button]:transition-colors [&>button]:duration-300
        "
      >
        <button onClick={() => navigate('/top')}>Top Anime</button>
        <button onClick={() => navigate('/genre-picker')}>Browse by Genre</button>
        <button onClick={() => navigate('/all-anime')}>All Anime</button>
        <button onClick={() => navigate('/upcoming')}>Upcoming Anime</button>
      </div>

      {/* Trending Section */}
      <div className="max-w-[1200px] my-8 px-2">
        <h2 className="text-xl text-left mb-4">
          <span
            onClick={() => navigate('/seasonal')}
            className="cursor-pointer hover:underline hover:text-[#36454F] transition-colors duration-200"
          >
            Trending This Season
          </span>
        </h2>

        {/* Without a key the image, title and link will all update just fine but the underlying DOM node is reused
        instead of deleted and created for new entries which can cause subtle bugs with state or animations */}
        <div className="flex flex-wrap justify-start gap-6">
          {seasonalAnime.map((anime) => (
          <div
            key={anime.mal_id}
            className="
              w-44 flex flex-col items-center
              transform transition-transform duration-200
              hover:scale-105 hover:z-10
            "
          >
            <div className="w-full aspect-[2/3] overflow-hidden rounded-lg shadow-md">
              <img
                src={anime.images?.jpg?.image_url}
                alt={anime.title}
                className="w-full h-full object-cover"
                onClick={() => handleViewDetails(anime, navigate)}
              />
            </div>
            <p
              className="mt-2 text-sm text-center cursor-pointer text-black hover:text-[#36454F] transition-colors duration-200"
              onClick={() => handleViewDetails(anime, navigate)}
            >
              {anime.title_english || anime.title}
            </p>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
