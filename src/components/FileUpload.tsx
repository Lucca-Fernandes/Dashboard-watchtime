import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import Papa from 'papaparse';
import type { WatchTimeData } from '../types';

interface FileUploadProps {
  onFileUpload: (data: WatchTimeData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('Por favor, selecione um arquivo CSV.');
      return;
    }

    setError(null);
    setLoading(true);

    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData = results.data as WatchTimeData[];
          onFileUpload(parsedData); 
        } catch (err: any) {
          setError('Erro ao processar o arquivo CSV. Verifique o formato.');
          console.error('Erro de parse:', err);
        } finally {
          setLoading(false);
        }
      },
      error: (err: any) => {
        setError('Erro ao ler o arquivo CSV.');
        console.error('Erro geral:', err);
        setLoading(false);
      },
    });
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h5" gutterBottom>
        Upload de Relatório Watch Time
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Button
            variant="contained"
            component="label"
            sx={{ mb: 2 }}
          >
            Selecionar Arquivo CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default FileUpload;