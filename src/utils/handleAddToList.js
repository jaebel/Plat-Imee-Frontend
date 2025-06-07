import axiosInstance from '../api/axiosInstance';

/**
 * Adds an anime to the user's list if not already added.
 * @param {number} malId - The MyAnimeList ID of the anime.
 * @param {object} user - The current logged-in user.
 * @param {function} setMessages - State setter for displaying feedback.
 * @param {function} setRecords - Setter for updating the cached records.
 * @param {array} records - The current cached records.
 */
export async function handleAddToList(malId, user, setMessages, setRecords, records) {
  const newMessages = {};

  if (!user || !user.userId) {
    newMessages[malId] = 'You must be logged in to add anime to your list.';
    setMessages(prev => ({ ...prev, ...newMessages }));
    return;
  }

  try {
    const res = await axiosInstance.post('/user-anime', {
      userId: user.userId,
      malId: malId,
    });

    const newRecord = res.data;
    newMessages[malId] = 'Anime added to your list!';

    setRecords(prev => [...(prev || []), newRecord]); // 👈 Update cache directly
  } catch (err) {
    console.error('Error adding anime:', err);
    newMessages[malId] = 'Failed to add anime.';
  }

  setMessages(prev => ({ ...prev, ...newMessages }));
}
