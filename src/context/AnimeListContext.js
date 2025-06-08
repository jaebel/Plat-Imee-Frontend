import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const AnimeListContext = createContext();

export const AnimeListProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const [records, setRecords] = useState(null);
    const [animeNames, setAnimeNames] = useState({});
    const [episodeCounts, setEpisodeCounts] = useState({});
    const [cachedUserId, setCachedUserId] = useState(null); // ⬅️ New

    useEffect(() => {
        if (!user?.userId || user.userId !== cachedUserId) {
            // Reset cache if logged out or user changed
            setRecords(null);
            setAnimeNames({});
            setEpisodeCounts({});
            setCachedUserId(user?.userId || null);
        }
    }, [user?.userId, cachedUserId]);

    return (
        <AnimeListContext.Provider value={{
            records,
            setRecords,
            animeNames,
            setAnimeNames,
            episodeCounts,
            setEpisodeCounts
        }}>
            {children}
        </AnimeListContext.Provider>
    );
};

export const useAnimeList = () => useContext(AnimeListContext);
