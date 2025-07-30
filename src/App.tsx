// src/App.tsx
import React from 'react';
import AppRoutes from './routes/routes';
import { DataProvider } from './context/DataContext';

// Importações do Material-UI para o tema
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/Theme'; // Importa o objeto de tema diretamente

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