import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const AnimeListContext = createContext();

export const AnimeListProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    // Store per-user cache of anime data
    // Structure: { [userId]: { records, animeNames, episodeCounts } }
    const [userAnimeCache, setUserAnimeCache] = useState({});

    const currentUserId = user?.userId;

    // --- FIXED: now supports both direct and functional updates ---
    const setRecords = (update) => {
        if (!currentUserId) return;
        setUserAnimeCache(prev => {
            const prevUserData = prev[currentUserId] || {};
            const prevRecords = Array.isArray(prevUserData.records)
                ? prevUserData.records
                : [];
            const newRecords =
                typeof update === 'function' ? update(prevRecords) : update;

            return {
                ...prev,
                [currentUserId]: {
                    ...prevUserData,
                    records: newRecords,
                },
            };
        });
    };

    const setAnimeNames = (update) => {
        if (!currentUserId) return;
        setUserAnimeCache(prev => {
            const prevUserData = prev[currentUserId] || {};
            const prevNames =
                typeof prevUserData.animeNames === 'object'
                    ? prevUserData.animeNames
                    : {};
            const newNames =
                typeof update === 'function' ? update(prevNames) : update;

            return {
                ...prev,
                [currentUserId]: {
                    ...prevUserData,
                    animeNames: newNames,
                },
            };
        });
    };

    const setEpisodeCounts = (update) => {
        if (!currentUserId) return;
        setUserAnimeCache(prev => {
            const prevUserData = prev[currentUserId] || {};
            const prevCounts =
                typeof prevUserData.episodeCounts === 'object'
                    ? prevUserData.episodeCounts
                    : {};
            const newCounts =
                typeof update === 'function' ? update(prevCounts) : update;

            return {
                ...prev,
                [currentUserId]: {
                    ...prevUserData,
                    episodeCounts: newCounts,
                },
            };
        });
    };

    // Expose current user's cached data
    const value = {
        records: currentUserId
            ? userAnimeCache[currentUserId]?.records || null
            : null,
        animeNames: currentUserId
            ? userAnimeCache[currentUserId]?.animeNames || {}
            : {},
        episodeCounts: currentUserId
            ? userAnimeCache[currentUserId]?.episodeCounts || {}
            : {},
        setRecords,
        setAnimeNames,
        setEpisodeCounts,
    };

    // Cleanup when user logs out or changes
    useEffect(() => {
        if (!currentUserId) return;
        // Ensure user has a cache entry
        setUserAnimeCache(prev => ({
            ...prev,
            [currentUserId]: prev[currentUserId] || {
                records: null,
                animeNames: {},
                episodeCounts: {},
            },
        }));
    }, [currentUserId]);

    return (
        <AnimeListContext.Provider value={value}>
            {children}
        </AnimeListContext.Provider>
    );
};

export const useAnimeList = () => useContext(AnimeListContext);
