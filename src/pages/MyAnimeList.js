import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

// Define the various status tabs
const TABS = [
  { label: 'All Anime', value: 'ALL' },
  { label: 'Currently Watching', value: 'WATCHING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Dropped', value: 'DROPPED' },
  { label: 'Plan to Watch', value: 'PLAN_TO_WATCH' },
];

const MyAnimeList = () => {
  const { user } = useContext(AuthContext);

  // All user-anime records
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active tab (status)
  const [activeTab, setActiveTab] = useState('ALL');

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    status: '',
    rating: '',
    episodesWatched: ''
  });

  // Fetch user-anime records once user is known
  useEffect(() => {
    if (!user || !user.userId) {
      setError('No user logged in.');
      setLoading(false);
      return;
    }

    axiosInstance.get(`/user-anime?userId=${user.userId}`)
      .then(res => {
        setRecords(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching your anime list.');
        setLoading(false);
      });
  }, [user]);

  // Filter records based on active tab
  const filteredRecords = activeTab === 'ALL'
    ? records
    : records.filter(rec => rec.status === activeTab);

  // Start editing a record
  const handleEditClick = (record) => {
    setEditingId(record.id);
    setEditData({
      status: record.status || '',
      rating: record.rating !== null ? record.rating.toString() : '',
      episodesWatched: record.episodesWatched !== null ? record.episodesWatched.toString() : ''
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ status: '', rating: '', episodesWatched: '' });
  };

  // Handle input changes in the edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Save the updated record via PATCH
  const handleSave = (recordId) => {
    const payload = {
      status: editData.status || null,
      rating: editData.rating !== '' ? parseFloat(editData.rating) : null,
      episodesWatched: editData.episodesWatched !== '' ? parseInt(editData.episodesWatched, 10) : null
    };

    axiosInstance.patch(`/user-anime/${recordId}`, payload)
      .then(res => {
        const updated = res.data;
        // Update local records
        setRecords(prev => prev.map(r => (r.id === recordId ? updated : r)));
        setEditingId(null);
      })
      .catch(err => {
        console.error('Error updating record:', err);
        alert('Failed to update record.');
      });
  };

  // Delete a record via DELETE
  const handleDelete = (recordId) => {
    if (!window.confirm('Are you sure you want to remove this anime from your list?')) {
      return;
    }
    axiosInstance.delete(`/user-anime/${recordId}`)
      .then(() => {
        // Remove it from local state
        setRecords(prev => prev.filter(r => r.id !== recordId));
      })
      .catch(err => {
        console.error('Error deleting record:', err);
        alert('Failed to delete record.');
      });
  };

  if (loading) return <div>Loading your anime list...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!user) return <div style={{ color: 'red' }}>No user logged in.</div>;

  return (
    <div style={{ padding: '1em' }}>
      <h1>My Anime List</h1>

      {/* Tabs for filtering by status */}
      <div style={{ marginBottom: '1em' }}>
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            style={{
              fontWeight: activeTab === tab.value ? 'bold' : 'normal',
              marginRight: '0.5em'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <p>No anime found in this category.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left' }}>#</th>
              <th style={{ textAlign: 'left' }}>Anime ID</th>
              <th style={{ textAlign: 'left' }}>Status</th>
              <th style={{ textAlign: 'left' }}>Rating</th>
              <th style={{ textAlign: 'left' }}>Episodes</th>
              <th style={{ textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((rec, idx) => {
              const isEditing = editingId === rec.id;
              return (
                <tr key={rec.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{idx + 1}</td>
                  <td>
                    <Link to={`/anime/${rec.animeId}`}>
                      {rec.animeId}
                    </Link>
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        name="status"
                        value={editData.status}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">--Select--</option>
                        <option value="WATCHING">Watching</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="PLAN_TO_WATCH">Plan to Watch</option>
                        <option value="DROPPED">Dropped</option>
                      </select>
                    ) : (
                      rec.status || 'N/A'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        name="rating"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editData.rating}
                        onChange={handleEditChange}
                        placeholder="0 - 10"
                      />
                    ) : (
                      rec.rating ?? 'Not rated'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        name="episodesWatched"
                        min="0"
                        value={editData.episodesWatched}
                        onChange={handleEditChange}
                        placeholder="0"
                      />
                    ) : (
                      rec.episodesWatched ?? 'N/A'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSave(rec.id)}>Save</button>
                        <button onClick={handleCancelEdit} style={{ marginLeft: '0.5em' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(rec)}>Edit</button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          style={{ marginLeft: '0.5em', color: 'red' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '1em' }}>
        <Link to="/anime">Back to Anime List</Link>
      </div>
    </div>
  );
};

export default MyAnimeList;
