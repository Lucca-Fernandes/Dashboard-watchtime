import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import CompletedCourses from '../components/CompletedCourses';
import DataTable from '../components/DataTable';
import { Typography, Box, TextField, Button } from '@mui/material';
import type { WatchTimeData } from '../types';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<WatchTimeData[]>([]);
  const [filteredData, setFilteredData] = useState<WatchTimeData[]>([]);
  const [inputEmail, setInputEmail] = useState<string>('');
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFileUpload = (uploadedData: WatchTimeData[]) => {
    if (uploadedData.length === 0) return;
    setData(uploadedData); // Substitui os dados existentes, evitando acumulação
    setFilteredData(uploadedData); // Inicializa com todos os dados
    setIsUploaded(true);
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

  return (
    <Box sx={{ p: 4 }}>
      {!isUploaded ? (
        <FileUpload onFileUpload={handleFileUpload} />
      ) : (
        <>
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
          <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={handleManagementClick}>
            Gestão
          </Button>
        </>
      )}
    </Box>
  );
};

export default Dashboard;