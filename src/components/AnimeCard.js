import React from 'react';

const truncate = (text, max) =>
  text && text.length > max ? text.slice(0, max) + "..." : text;

const AnimeCard = ({ 
  anime, 
  message, 
  onAddToList, 
  onViewDetails 
}) => {
  return (
    <li className="flex flex-row gap-4 p-4 border border-[#333] rounded-md bg-[#36454F] overflow-hidden transition-all duration-300 ease">
      {/* Image Section */}
      <div className="flex-shrink-0 w-[140px] sm:w-[160px]">
        <img
          src={anime.images?.jpg?.image_url}
          alt={anime.title}
          className="w-full h-full object-cover rounded transition-transform duration-200 hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-between flex-grow min-w-0 self-stretch">
        <div className="flex-grow">
          {/* Title */}
          <h2 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2">
            {anime.title_english || anime.title}
          </h2>

          {/* Synopsis */}
          <p className="text-gray-300 text-sm mb-2 hidden md:block line-clamp-2">
            <strong>Synopsis:</strong> {truncate(anime.synopsis, 80)}
          </p>

          {/* Details */}
          <div className="text-gray-300 text-xs sm:text-sm space-y-1 mb-2">
            <p className="truncate">
              <strong>Type:</strong> {anime.type || 'TV'}
            </p>
            <p className="truncate hidden sm:block">
              <strong>Aired:</strong> {anime.aired?.string || 'Unknown'}
            </p>
            <p>
              <strong>Rating:</strong> {anime.score ?? 'N/A'}
            </p>
          </div>

          {/* Reserved message space */}
          <div className="min-h-[20px] mb-2">
            {message && (
              <p
                className={`text-xs sm:text-sm truncate ${
                  message.includes('added')
                    ? 'text-[#00E676]'
                    : 'text-[#FF5252]'
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Button Section */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onAddToList}
            className="w-full bg-[#a18787] hover:bg-[#5e4e4e] text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-md font-medium text-xs sm:text-sm shadow transition"
          >
            Add to List
          </button>

          <button
            onClick={onViewDetails}
            className="w-full bg-[#07161d] hover:bg-[#12394b] text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-md font-medium text-xs sm:text-sm shadow transition"
          >
            View Details
          </button>
        </div>
      </div>
    </li>
  );
};

export default AnimeCard;