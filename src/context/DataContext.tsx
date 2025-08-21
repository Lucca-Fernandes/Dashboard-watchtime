import React, { createContext, useContext, useState } from 'react';
import type { WatchTimeData } from '../types';

interface DataContextType {
  data: WatchTimeData[];
  setData: React.Dispatch<React.SetStateAction<WatchTimeData[]>>;
  isDataLoaded: boolean; 
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WatchTimeData[]>([]);
  
  const isDataLoaded = data.length > 0;

  return (
    <DataContext.Provider value={{ data, setData, isDataLoaded }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};