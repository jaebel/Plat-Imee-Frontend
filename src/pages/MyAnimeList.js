// MyAnimeList.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const MyAnimeList = () => {
  const { user } = useContext(AuthContext);
  const [myAnimeList, setMyAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !user.userId) {
      setError('No user ID found. Please log in.');
      setLoading(false);
      return;
    }

    axiosInstance.get(`/user-anime?userId=${user.userId}`)
      .then(response => {
        setMyAnimeList(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching your anime list.');
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div>Loading your anime list...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>My Anime List</h1>
      {myAnimeList.length === 0 ? (
        <p>You have not added any anime yet.</p>
      ) : (
        <ul>
          {myAnimeList.map((anime) => (
            <li key={anime.id}>
              {/* Link to the anime details page */}
              <Link to={`/anime/${anime.animeId}`}>
                <h2>Anime ID: {anime.animeId}</h2>
              </Link>
              {/* Display any info from the response: status, rating, etc. */}
              <p>Status: {anime.status}</p>
              <p>Rating: {anime.rating}</p>
              <p>Episodes Watched: {anime.episodesWatched}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyAnimeList;
