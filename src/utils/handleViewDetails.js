import axiosInstance from '../api/axiosInstance';

/**
 * Optional helper to convert Jikan type to internal enum type
 */
function mapJikanType(jikanType) {
  if (!jikanType) return "TV";
  const upper = jikanType.toUpperCase();
  switch (upper) {
    case "TV":
    case "MOVIE":
    case "OVA":
    case "ONA":
    case "SPECIAL":
      return upper;
    default:
      return "TV";
  }
}

/**
 * Fetches or creates a local anime record and navigates to its details page.
 * @param {Object} anime - The anime object from Jikan.
 * @param {Function} navigate - The React Router navigation function.
 */
export async function handleViewDetails(anime, navigate) {
  const malId = anime.mal_id;

  try {
    await axiosInstance.get(`/anime/${malId}`);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      try {
        const jikanType = mapJikanType(anime.type);
        const payload = {
          malId,
          name: anime.title_english || anime.title,
          type: jikanType,
          episodes: anime.episodes || 1,
          score: anime.score || 0.0,
          aired: anime.aired?.string || '',
          premiered: anime.season || '',
          genres: []
        };
        await axiosInstance.post('/anime', payload);
      } catch (createErr) {
        console.error('Error creating anime record:', createErr);
        alert('Failed to create local record for this anime.');
        return;
      }
    } else {
      console.error('Error checking local anime record:', err);
      alert('Error checking local anime record.');
      return;
    }
  }

  navigate(`/anime/${malId}`);
}
