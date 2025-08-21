import React from 'react';
import AppRoutes from './routes/routes';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/Theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </div>
    </ThemeProvider>
  );
};

export default App;