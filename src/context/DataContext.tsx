import React, { createContext, useContext, useState } from 'react';
import type { WatchTimeData } from '../types';

interface DataContextType {
  data: WatchTimeData[];
  setData: React.Dispatch<React.SetStateAction<WatchTimeData[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WatchTimeData[]>([]);

  return (
    <DataContext.Provider value={{ data, setData }}>
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