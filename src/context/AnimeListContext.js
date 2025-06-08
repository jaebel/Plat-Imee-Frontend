import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const AnimeListContext = createContext();

export const AnimeListProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const [userAnimeCache, setUserAnimeCache] = useState({}); // { [userId]: { records, animeNames, episodeCounts } }

    const currentUserId = user?.userId;

    const setRecords = (newRecords) => {
        if (!currentUserId) return;
        setUserAnimeCache(prev => ({
            ...prev,
            [currentUserId]: {
                ...(prev[currentUserId] || {}),
                records: newRecords
            }
        }));
    };

    const setAnimeNames = (names) => {
        if (!currentUserId) return;
        setUserAnimeCache(prev => ({
            ...prev,
            [currentUserId]: {
                ...(prev[currentUserId] || {}),
                animeNames: names
            }
        }));
    };

    const setEpisodeCounts = (counts) => {
        if (!currentUserId) return;
        setUserAnimeCache(prev => ({
            ...prev,
            [currentUserId]: {
                ...(prev[currentUserId] || {}),
                episodeCounts: counts
            }
        }));
    };

    const value = {
        records: currentUserId ? userAnimeCache[currentUserId]?.records || null : null,
        animeNames: currentUserId ? userAnimeCache[currentUserId]?.animeNames || {} : {},
        episodeCounts: currentUserId ? userAnimeCache[currentUserId]?.episodeCounts || {} : {},
        setRecords,
        setAnimeNames,
        setEpisodeCounts
    };

    return (
        <AnimeListContext.Provider value={value}>
            {children}
        </AnimeListContext.Provider>
    );
};

export const useAnimeList = () => useContext(AnimeListContext);
