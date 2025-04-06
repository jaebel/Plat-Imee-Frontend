import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

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
  const [animeNames, setAnimeNames] = useState({});
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
      .then(async res => {
        const userRecords = res.data;
        setRecords(userRecords);

        const malIds = [...new Set(userRecords.map(r => r.malId))];
        const nameMap = {};

        await Promise.all(malIds.map(async (malId) => {
          try {
            const response = await axiosInstance.get(`/anime/${malId}`);
            nameMap[malId] = response.data.name || 'Unknown Title';
          } catch {
            nameMap[malId] = 'Unknown Title';
          }
        }));

        setAnimeNames(nameMap);
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
    if (!window.confirm('Are you sure you want to remove this anime from your list?')) return;

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

  const handleRowClick = (e, record) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'button' || tag === 'a' || editingId === record.id) return;
    handleEditClick(record);
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
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              {['#', 'MAL ID', 'Anime Name', 'Status', 'Rating', 'Episodes Watched', 'Actions'].map((heading, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: 'left',
                    padding: '0.5em',
                    verticalAlign: 'top',
                    wordWrap: 'break-word'
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((rec, idx) => {
              const isEditing = editingId === rec.id;
              return (
                <tr
                  key={rec.id}
                  style={{ borderBottom: '1px solid #ccc', cursor: 'pointer' }}
                  onClick={(e) => handleRowClick(e, rec)}
                >
                  <td style={{ padding: '0.5em' }}>{idx + 1}</td>
                  <td style={{ padding: '0.5em' }}>
                    <Link to={`/anime/${rec.malId}`} onClick={(e) => e.stopPropagation()}>
                      {rec.malId}
                    </Link>
                  </td>
                  <td style={{ padding: '0.5em' }}>{animeNames[rec.malId] || 'Unknown Title'}</td>
                  <td style={{ padding: '0.5em' }}>
                    {isEditing ? (
                      <select
                        name="status"
                        value={editData.status}
                        onChange={handleEditChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(rec.id)}
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
                  <td style={{ padding: '0.5em' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        name="rating"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editData.rating}
                        onChange={handleEditChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(rec.id)}
                        placeholder="0 - 10"
                      />
                    ) : (
                      rec.rating ?? 'Not rated'
                    )}
                  </td>
                  <td style={{ padding: '0.5em' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        name="episodesWatched"
                        min="0"
                        value={editData.episodesWatched}
                        onChange={handleEditChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(rec.id)}
                        placeholder="0"
                      />
                    ) : (
                      rec.episodesWatched ?? 'N/A'
                    )}
                  </td>
                  <td style={{ padding: '0.5em' }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSave(rec.id)}>Save</button>
                        <button onClick={handleCancelEdit} style={{ marginLeft: '0.5em' }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(rec); }}>Edit</button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(rec.id);
                          }}
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
    </div>
  );
};

export default MyAnimeList;
