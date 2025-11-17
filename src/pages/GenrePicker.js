import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JIKAN_GENRE_OPTIONS = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 3, name: "Racing" },
  { id: 4, name: "Comedy" },
  { id: 5, name: "Avant Garde" },
  { id: 6, name: "Mythology" },
  { id: 7, name: "Mystery" },
  { id: 8, name: "Drama" },
  // skipped ecchi
  { id: 10, name: "Fantasy" },
  { id: 11, name: "Strategy Game" },
  // skipped hentai
  { id: 13, name: "Historical" },
  { id: 14, name: "Horror" },
  { id: 15, name: "Kids" },
  { id: 18, name: "Mecha" },
  { id: 19, name: "Music" },
  { id: 20, name: "Parody" },
  { id: 21, name: "Samurai" },
  { id: 22, name: "Romance" },
  { id: 23, name: "School" },
  { id: 24, name: "Sci-Fi" },
  { id: 25, name: "Shoujo" },
  { id: 26, name: "Girls Love" },
  { id: 27, name: "Shounen" },
  { id: 28, name: "Boys Love" },
  { id: 29, name: "Space" },
  { id: 30, name: "Sports" },
  { id: 31, name: "Super Power" },
  { id: 32, name: "Vampire" },
  { id: 35, name: "Harem" },
  { id: 36, name: "Slice of Life" },
  { id: 37, name: "Supernatural" },
  { id: 38, name: "Military" },
  { id: 39, name: "Detective" },
  { id: 40, name: "Psychological" },
  { id: 41, name: "Suspense" },
  { id: 42, name: "Seinen" },
  { id: 43, name: "Josei" },
  { id: 44, name: "Award Winning" },
  { id: 47, name: "Gourmet" },
  { id: 48, name: "Workplace" },
  { id: 50, name: "Adult Cast" },
  { id: 51, name: "Anthropomorphic" },
  { id: 52, name: "CGDCT" },
  { id: 53, name: "Childcare" },
  { id: 54, name: "Combat Sports" },
  { id: 55, name: "Delinquents" },
  { id: 56, name: "Educational" },
  { id: 57, name: "Gag Humor" },
  { id: 58, name: "Gore" },
  { id: 59, name: "High Stakes Game" },
  { id: 60, name: "Idols (Female)" },
  { id: 61, name: "Idols (Male)" },
  { id: 62, name: "Isekai" },
  { id: 63, name: "Iyashikei" },
  { id: 64, name: "Love Polygon" },
  // skipped Magical Sex Shift
  { id: 66, name: "Mahou Shoujo" },
  { id: 67, name: "Medical" },
  { id: 68, name: "Organized Crime" },
  { id: 69, name: "Otaku Culture" },
  { id: 70, name: "Performing Arts" },
  { id: 71, name: "Pets" },
  { id: 72, name: "Reincarnation" },
  { id: 73, name: "Reverse Harem" },
  { id: 74, name: "GorLove Status Quoe" },
  { id: 75, name: "Showbiz" },
  { id: 76, name: "Survival" },
  { id: 77, name: "Team Sports" },
  { id: 78, name: "Time Travel" },
  { id: 79, name: "Video Game" },
  { id: 80, name: "Visual Arts" },
  { id: 81, name: "Crossdressing" },
  { id: 82, name: "Urban Fantasy" },
  { id: 83, name: "Villainess" },
];

const GenrePicker = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenreChange = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSubmit = () => {
    if (selectedGenres.length === 0) {
      setError("Please select at least one genre.");
      return;
    }
    navigate(`/genre-results?genres=${selectedGenres.join(",")}`);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100 px-6 py-10">
      <h1 className="text-3xl font-semibold border-b border-neutral-700 pb-3 mb-4">
        Browse Anime by Genre
      </h1>

      <p className="text-neutral-300 mb-6">
        Select one or more genres, then click “Search”.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-6">
        {JIKAN_GENRE_OPTIONS.map((opt) => (
          <label
            key={opt.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition 
              ${
                selectedGenres.includes(opt.id)
                  ? "bg-[#DEB8B8]  hover:bg-[#d6a8a8] text-[#000000]"
                  : "bg-neutral-800 hover:bg-neutral-700"
              }`}
          >
            <input
              type="checkbox"
              checked={selectedGenres.includes(opt.id)}
              onChange={() => handleGenreChange(opt.id)}
              className="accent-[#000000]"
            />
            <span>{opt.name}</span>
          </label>
        ))}
      </div>
        
      <button
        onClick={handleSubmit}
        className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-md text-white font-medium transition"
      >
        Search
      </button>

      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default GenrePicker;
