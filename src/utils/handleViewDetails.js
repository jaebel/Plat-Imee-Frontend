import axiosInstance from '../api/axiosInstance';

const localCache = new Set(); // stores malId of anime already confirmed to exist

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

export async function handleViewDetails(anime, navigate) {
  const malId = anime.mal_id;

  if (!localCache.has(malId)) {
    try {
      await axiosInstance.get(`/anime/${malId}`);
      localCache.add(malId); // mark as confirmed
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          const payload = {
            malId,
            name: anime.title_english || anime.title,
            type: mapJikanType(anime.type),
            episodes: anime.episodes || 1,
            score: anime.score || 0.0,
            aired: anime.aired?.string || '',
            premiered: anime.season || '',
            genres: []
          };
          await axiosInstance.post('/anime', payload);
          localCache.add(malId); // mark as now existing
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
  }

  navigate(`/anime/${malId}`);
}
