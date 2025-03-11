import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

const JikanService = {
  /**
   * Fetch anime details from Jikan API using the MAL ID.
   * @param {number} malId - The official MAL ID of the anime.
   * @returns {Promise<Object>} - A promise resolving to the detailed anime data.
   */
  getAnimeDetails: async (malId) => {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime/${malId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Jikan data:', error);
      throw error;
    }
  }
};

export default JikanService;
