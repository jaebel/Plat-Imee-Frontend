import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useAnimeList } from '../context/AnimeListContext';
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
    const {
        records, setRecords,
        animeNames, setAnimeNames,
        episodeCounts, setEpisodeCounts
    } = useAnimeList();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ status: '', rating: '', episodesWatched: '' });

    // Effect 1: Fetch anime list only once per user session
    useEffect(() => {
        if (!user?.userId) return;
        if (records !== null) {
            // If we already have records (from context or cache), don't fetch again.
            setLoading(false);
            return;
        }

        const fetchAnimeList = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/user-anime/me`);
                const userRecords = Array.isArray(res.data) ? res.data : [];
                setRecords(userRecords);
            } catch (err) {
                console.error(err);
                setError('Error fetching your anime list.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnimeList();
    }, [user, records, setRecords]);

    // Effect 2: Fetch missing anime names & episode counts after records load
    useEffect(() => {
        if (!records || records.length === 0) return;

        const malIds = [...new Set(records.map(r => r.malId))];
        const missingMalIds = malIds.filter(id => !(id in animeNames));
        if (missingMalIds.length === 0) return; // nothing new to fetch

        const fetchMissingAnimeData = async () => {
            const nameMap = {};
            const episodeMap = {};

            await Promise.all(
                missingMalIds.map(async (malId) => {
                    try {
                        const response = await axiosInstance.get(`/anime/${malId}`);
                        nameMap[malId] = response.data.name || 'Unknown Title';
                        episodeMap[malId] = response.data.episodes ?? null;
                    } catch {
                        nameMap[malId] = 'Unknown Title';
                        episodeMap[malId] = null;
                    }
                })
            );

            // Merge new data with what’s already in context
            setAnimeNames(prev => ({ ...prev, ...nameMap }));
            setEpisodeCounts(prev => ({ ...prev, ...episodeMap }));
        };

        fetchMissingAnimeData();
    }, [records, animeNames, setAnimeNames, setEpisodeCounts]);

    // Filter records by tab
    const filteredRecords = activeTab === 'ALL'
        ? Array.isArray(records) ? records : []
        : (Array.isArray(records) ? records : []).filter(rec => rec.status === activeTab);

    const handleEditClick = (record) => {
        setEditingId(record.id);
        setEditData({
            status: record.status || '',
            rating: record.rating !== null ? record.rating.toString() : '',
            episodesWatched: record.episodesWatched !== null ? record.episodesWatched.toString() : ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ status: '', rating: '', episodesWatched: '' });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (recordId) => {
        const payload = {
            status: editData.status || null,
            rating: editData.rating !== '' ? parseFloat(editData.rating) : null,
            episodesWatched: editData.episodesWatched !== '' ? parseInt(editData.episodesWatched, 10) : null
        };

        try {
            const res = await axiosInstance.patch(`/user-anime/${recordId}`, payload);
            const updated = res.data;
            setRecords(prev => {
                const current = Array.isArray(prev) ? prev : [];
                return current.map(r => (r.id === recordId ? updated : r));
            });
            setEditingId(null);
        } catch (err) {
            console.error('Error updating record:', err);
            alert('Failed to update record.');
        }
    };

    const handleDelete = async (recordId) => {
        if (!window.confirm('Are you sure you want to remove this anime from your list?')) return;

        try {
            await axiosInstance.delete(`/user-anime/${recordId}`);
            setRecords(prev => {
                const current = Array.isArray(prev) ? prev : [];
                return current.filter(r => r.id !== recordId);
            });
        } catch (err) {
            console.error('Error deleting record:', err);
            alert('Failed to delete record.');
        }
    };

    const handleRowClick = (e, record) => {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'button' || tag === 'a' || editingId === record.id) return;
        handleEditClick(record);
    };

    if (loading) {
        return (
            <div className="bg-[#1a2025] min-h-screen pt-12 text-white text-center">
                Loading your anime list...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#1a2025] min-h-screen pt-12 text-red-500 text-center">
                {error}
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-[#1a2025] min-h-screen pt-12 text-red-500 text-center">
                No user logged in.
            </div>
        );
    }

    return (
        <div className="bg-[#1a2025] min-h-screen pt-12 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#DEB8B8] rounded-lg">
                <h1 className="text-3xl font-semibold mb-6 border-b-2 border-[#444] pb-3 text-[#f0f0f0]">
                    My Anime List
                </h1>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-4 py-2 text-sm rounded transition-colors ${
                                activeTab === tab.value
                                    ? 'bg-[#3f3f3f] text-white font-bold'
                                    : 'bg-[#36454F] text-[#ccc] hover:bg-[#3f3f3f] hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {filteredRecords.length === 0 ? (
                    <p className="text-[#f0f0f0] text-center py-8">
                        No anime found in this category.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-lg">
                        <table className="w-full bg-[#36454F] text-[#f0f0f0] text-sm">
                            <thead className="bg-[#292929]">
                                <tr>
                                    {['#', 'MAL ID', 'Anime Name', 'Status', 'Rating', 'Episodes Watched', 'Actions'].map((heading, i) => (
                                        <th key={i} className="px-3 py-3 text-left text-[#ddd] font-medium">
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
                                            onClick={(e) => handleRowClick(e, rec)}
                                            className="border-b border-[#333] hover:bg-[#2c2c2c] cursor-pointer transition-colors"
                                        >
                                            <td className="px-3 py-3">{idx + 1}</td>
                                            <td className="px-3 py-3">
                                                <Link
                                                    to={`/anime/${rec.malId}`}
                                                    className="text-[#DEB8B8] underline font-bold hover:text-[#867070] transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {rec.malId}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-3">{animeNames[rec.malId] || 'Unknown Title'}</td>
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <select
                                                        name="status"
                                                        value={editData.status}
                                                        onChange={handleEditChange}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSave(rec.id)}
                                                        required
                                                        className="bg-[#2c2c2c] text-white border border-[#444] rounded px-2 py-1 text-sm"
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
                                            <td className="px-3 py-3">
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
                                                        className="bg-[#2c2c2c] text-white border border-[#444] rounded px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                                                    />
                                                ) : (
                                                    rec.rating ?? 'Not rated'
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            name="episodesWatched"
                                                            min="0"
                                                            max={episodeCounts[rec.malId] || undefined}
                                                            value={editData.episodesWatched}
                                                            onChange={handleEditChange}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleSave(rec.id)}
                                                            placeholder="0"
                                                            className="bg-[#2c2c2c] text-white border border-[#444] rounded px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                                                        />
                                                        <span className="text-xs text-[#ccc] whitespace-nowrap">
                                                            Max: {episodeCounts[rec.malId] ?? 'Unknown'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    rec.episodesWatched ?? 'N/A'
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSave(rec.id)}
                                                            className="bg-[#4caf50] text-white px-3 py-1.5 rounded text-xs hover:bg-[#3e8e41] transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="bg-[#666] text-white px-3 py-1.5 rounded text-xs hover:bg-[#555] transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditClick(rec); }}
                                                            className="bg-[#4caf50] text-white px-3 py-1.5 rounded text-xs hover:bg-[#3e8e41] transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(rec.id);
                                                            }}
                                                            className="bg-[#ff4d4d] text-white px-3 py-1.5 rounded text-xs hover:bg-[#e63939] transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAnimeList;