import React from 'react';
import AppRoutes from './routes/routes';
import { DataProvider } from './context/DataContext';

const App: React.FC = () => {
  return (
    <div className="App">
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </div>
  );
};

export default App;