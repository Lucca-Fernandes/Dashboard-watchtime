import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import Papa from 'papaparse';
import type { WatchTimeData } from '../types';

interface FileUploadProps {
  onFileUpload: (data: WatchTimeData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('Por favor, selecione um arquivo CSV.');
      return;
    }

    setError(null);
    console.time('Upload Time'); // Mede o tempo total
    console.log('Iniciando upload de:', file.name, 'Tamanho:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    const chunkSize = 20000; // Aumenta para 20.000 linhas por chunk
    let totalRows = 0;
    let allData: WatchTimeData[] = []; // Armazena todos os dados temporariamente

    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      chunkSize,
      chunk: (results, parser) => {
        try {
          const parsedData = results.data as WatchTimeData[];
          totalRows += parsedData.length;
          allData = [...allData, ...parsedData]; // Acumula os dados
          console.log('Chunk processado:', parsedData.length, 'Linhas totais:', totalRows);
        } catch (err) {
          setError('Erro ao processar uma parte do CSV. Verifique o formato.');
          console.error('Erro no chunk:', err, 'Linha problemática:', results.data);
          parser.abort();
        }
      },
      complete: () => {
        try {
          console.log('Upload completo, total de linhas processadas:', totalRows);
          onFileUpload(allData); // Envia todos os dados de uma vez ao final
          allData = []; // Limpa para liberar memória
        } catch (err) {
          setError('Erro ao finalizar o processamento do CSV.');
          console.error('Erro final:', err);
        } finally {
          console.timeEnd('Upload Time'); // Mostra o tempo total
        }
      },
      error: (err) => {
        setError('Erro ao ler o arquivo CSV.');
        console.error('Erro geral:', err);
      },
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Upload de Relatório Watch Time
      </Typography>
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
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;