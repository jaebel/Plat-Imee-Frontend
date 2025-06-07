import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const AnimeListContext = createContext();

export const AnimeListProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const [records, setRecords] = useState(null);
    const [animeNames, setAnimeNames] = useState({});
    const [episodeCounts, setEpisodeCounts] = useState({});

    // 🧹 Clear cache when user logs out or switches
    useEffect(() => {
        setRecords(null);
        setAnimeNames({});
        setEpisodeCounts({});
    }, [user?.userId]);

    return (
        <AnimeListContext.Provider value={{ records, setRecords, animeNames, setAnimeNames, episodeCounts, setEpisodeCounts }}>
            {children}
        </AnimeListContext.Provider>
    );
};

export const useAnimeList = () => useContext(AnimeListContext);
