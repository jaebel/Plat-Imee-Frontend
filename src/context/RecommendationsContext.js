import { createContext, useState } from 'react';

export const RecommendationsContext = createContext();

export const RecommendationsProvider = ({ children }) => {
  const [recommendations, setRecommendations] = useState([]);

  return (
    <RecommendationsContext.Provider value={{ recommendations, setRecommendations }}>
      {children}
    </RecommendationsContext.Provider>
  );
};
