// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import CompletedCourses from '../components/CompletedCourses';
import DataTable from '../components/DataTable';
import { Typography, Box, TextField, Button, CircularProgress } from '@mui/material';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import type { WatchTimeData } from '../types';
import Papa from 'papaparse';

const Dashboard: React.FC = () => {
  const { data, setData, isDataLoaded } = useData(); 
  const [filteredData, setFilteredData] = useState<WatchTimeData[]>(data); 
  const [inputEmail, setInputEmail] = useState<string>('');
  const [showFileUploadInput, setShowFileUploadInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleLoadPredefinedCsv = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/relatorio_watchtime_padrao.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        delimiter: ';', 
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data as WatchTimeData[];
          if (parsedData.length > 0) {
            setData(parsedData); 
          } else {
            alert('O arquivo CSV padrão está vazio ou com formato inválido.');
          }
          setIsLoading(false);
        },
        error: (error: any) => {
          console.error("Erro ao parsear CSV padrão:", error);
          alert('Erro ao carregar o arquivo CSV padrão.');
          setIsLoading(false);
        },
      });
    } catch (error: any) {
      console.error('Erro ao buscar o arquivo CSV padrão:', error);
      alert('Não foi possível carregar o CSV padrão. Verifique o arquivo.');
      setIsLoading(false);
    }
  };

  const handleFileUpload = (uploadedData: WatchTimeData[]) => {
    if (uploadedData.length === 0) {
        alert('O arquivo CSV carregado está vazio ou com formato inválido.');
        return;
    }
    setData(uploadedData);
    setFilteredData(uploadedData);
  };

  const handleSearch = () => {
    const email = inputEmail.toLowerCase();
    const filtered = data.filter(item =>
      item.user_email.toLowerCase().includes(email)
    );
    setFilteredData(filtered);
  };

  const handleManagementClick = () => {
    navigate('/Gestão');
  };

  if (isDataLoaded) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Dashboard Watch Time
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Filtrar por email"
            variant="outlined"
            fullWidth
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Buscar
          </Button>
        </Box>

        <DataTable data={filteredData} />
        <CompletedCourses data={filteredData} />
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={handleManagementClick}
        >
          Gestão de Agentes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Dashboard de Watch Time
      </Typography>
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Carregando CSV padrão...</Typography>
        </Box>
      ) : showFileUploadInput ? (
        // Chamada correta do FileUpload com a prop 'onFileUpload'
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <FileUpload onFileUpload={handleFileUpload} /> 
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Escolha uma opção para começar:</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLoadPredefinedCsv}
            sx={{ width: '250px' }}
          >
            Usar CSV Padrão
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setShowFileUploadInput(true)}
            sx={{ width: '250px' }}
          >
            Carregar Novo CSV
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;