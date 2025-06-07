import React, { createContext, useContext, useState } from 'react';

const AnimeListContext = createContext();

export const AnimeListProvider = ({ children }) => {
    const [records, setRecords] = useState(null); // null means not fetched yet
    const [animeNames, setAnimeNames] = useState({});
    const [episodeCounts, setEpisodeCounts] = useState({});

    return (
        <AnimeListContext.Provider value={{ records, setRecords, animeNames, setAnimeNames, episodeCounts, setEpisodeCounts }}>
            {children}
        </AnimeListContext.Provider>
    );
};

export const useAnimeList = () => useContext(AnimeListContext);
