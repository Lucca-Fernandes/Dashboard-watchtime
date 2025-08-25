import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Papa from 'papaparse';

interface GradeData {
  'Usuário': string;
  'Nota total (%)': string;
  // Outras colunas ignoradas
}

const StudentGrades: React.FC = () => {
  const [gradesData, setGradesData] = useState<GradeData[]>([]);
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [studentGrade, setStudentGrade] = useState<GradeData | null>(null);

  useEffect(() => {
    // Carrega o CSV fixo da pasta public
    fetch('/course-v1_ProjetoDesenvolve+Scratch1+01.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true,
          complete: (results) => {
            setGradesData(results.data as GradeData[]);
          },
          error: (error: any) => {
            console.error('Erro ao parsear CSV de notas:', error);
          },
        });
      })
      .catch(error => {
        console.error('Erro ao carregar CSV de notas:', error);
      });
  }, []);

  const handleSearch = () => {
    if (!searchEmail.trim()) {
      setStudentGrade(null);
      return;
    }

    const username = searchEmail.split('@')[0].toLowerCase(); // Extrai parte antes do @
    const foundStudent = gradesData.find(item => item['Usuário'].toLowerCase() === username);

    setStudentGrade(foundStudent || null);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Notas e Aprovação em Scratch
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Buscar por Email do Aluno"
          variant="outlined"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Digite o email completo (ex: estudante2@exemplo.com)"
          sx={{ mb: 2 }}
        />
        <button onClick={handleSearch}>Buscar</button> {/* Ou use Button do MUI */}
        {studentGrade ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Aluno: {studentGrade['Usuário']}</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nota Total (%)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{studentGrade['Nota total (%)']}</TableCell>
                  <TableCell>
                    {parseFloat(studentGrade['Nota total (%)']) >= 60 ? (
                      <Chip icon={<CheckIcon />} label="Aprovado" color="success" variant="outlined" />
                    ) : (
                      <Chip icon={<CloseIcon />} label="Reprovado" color="error" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        ) : searchEmail.trim() !== '' && (
          <Typography sx={{ mt: 2 }}>Nenhum aluno encontrado com esse email.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default StudentGrades;