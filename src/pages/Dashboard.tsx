import React, { useState, useEffect, useMemo } from 'react';
import FileUpload from '../components/FileUpload';
import CompletedCourses from '../components/CompletedCourses';
import DataTable from '../components/DataTable';
import {
  Typography, Box, TextField, Button, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import type { WatchTimeData } from '../types';
import Papa from 'papaparse';
import { predefinedTotals, courseNameMappings } from '../utils/constants';
import { timeToSeconds } from '../utils/timeUtils';

type DetailedStudentData = {
  studentEmail: string;
  disciplineCompletion: { [discipline: string]: boolean };
};


const Dashboard: React.FC = () => {
  const { data, setData, isDataLoaded } = useData();
  const [filteredData, setFilteredData] = useState<WatchTimeData[]>(data);
  const [inputEmail, setInputEmail] = useState<string>('');
  const [showFileUploadInput, setShowFileUploadInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const [agentEmail, setAgentEmail] = useState<string>('');
  const [detailedAgentStudentsData, setDetailedAgentStudentsData] = useState<DetailedStudentData[] | null>(null);

  const modules = useMemo(() => ({
    "Módulo 1: Fundamentos": [
      "Scratch",
      "No Code",
      "Introdução a Web",
      "Linux",
      "Programação Básica com Python"
    ],
    "Módulo 2: Backend e Dados": [
      "JavaScript",
      "Programação Orientada a Objetos",
      "Programação Intermediária com Python - Python II",
      "Banco de Dados Relacional"
    ],
    "Módulo 3: Frontend e Mobile": [
      "Fundamentos de Interface",
      "Desenvolvimento de websites com mentalidade ágil",
      "Desenvolvimento de Interfaces Web Frameworks Front-End",
      "React JS",
      "Programação Multiplataforma com React Native",
      "Programação Multiplataforma com Flutter"
    ],
    "Módulo 4: Avançado e Ferramentas": [
      "Padrão de Projeto de Software",
      "Desenvolvimento Nativo para Android",
      "Desenvolvimento de APIs RESTful",
      "Teste de Software Para Web"
    ],
    "Projetos e Outros": [
      "Projetos II",
      "Tutorial Plataforma"
    ]
  }), []);

  const disciplines = useMemo(() => Object.values(modules).flat(), [modules]);

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
    setDetailedAgentStudentsData(null);
  };

  const handleAgentSearch = () => {
    if (!agentEmail) {
      setDetailedAgentStudentsData(null);
      return;
    }

    const filteredByAgent = data.filter(item =>
      item.ags?.toLowerCase() === agentEmail.toLowerCase()
    );

    const studentCompletionMap = new Map<string, { [discipline: string]: Set<string> }>();

    filteredByAgent.forEach(item => {
      const userEmail = item.user_email;
      const normalizedDiscipline = courseNameMappings[item.course_name] || item.course_name;
      const videoTotalSeconds = timeToSeconds(item.video_total_duration);
      const totalSecondsWatched = timeToSeconds(item.total_duration);

      const isLessonCompletedByDuration =
        videoTotalSeconds > 0 &&
        totalSecondsWatched >= (videoTotalSeconds * 0.5);

      if (isLessonCompletedByDuration) {
        if (!studentCompletionMap.has(userEmail)) {
          studentCompletionMap.set(userEmail, {});
        }
        const studentProgress = studentCompletionMap.get(userEmail)!;
        if (!studentProgress[normalizedDiscipline]) {
          studentProgress[normalizedDiscipline] = new Set();
        }
        studentProgress[normalizedDiscipline].add(item.id);
      }
    });

    const detailedData: DetailedStudentData[] = [];
    studentCompletionMap.forEach((disciplinesWatched, studentEmail) => {
      const disciplineCompletion: { [key: string]: boolean } = {};
      disciplines.forEach(discipline => {
        const normalizedDiscipline = courseNameMappings[discipline] || discipline;
        const totalLessonsForDiscipline = predefinedTotals[normalizedDiscipline] || 0;
        const lessonsCompleted = disciplinesWatched[normalizedDiscipline]?.size || 0;

        const isCompleted = totalLessonsForDiscipline > 0 && (lessonsCompleted / totalLessonsForDiscipline) >= 0.8;
        disciplineCompletion[discipline] = isCompleted;
      });
      detailedData.push({ studentEmail, disciplineCompletion });
    });

    setDetailedAgentStudentsData(detailedData);
  };

  const handleManagementClick = () => {
    navigate('/Gestao');
  };

  if (isDataLoaded) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Dashboard Watch Time
        </Typography>

        {/* Filtro de Aluno */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Filtrar por email do aluno"
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
            Buscar Aluno
          </Button>
        </Box>

        {/* Novo Filtro de Agente */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, mt: 4 }}>
          <TextField
            label="Pesquisar por email do agente"
            variant="outlined"
            fullWidth
            value={agentEmail}
            onChange={(e) => setAgentEmail(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAgentSearch}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Buscar Agente
          </Button>
        </Box>

        {detailedAgentStudentsData ? (
          <Paper sx={{ p: 3, mt: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Status de Conclusão por Aluno e Disciplina
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 200, fontWeight: 'bold' }}>Aluno</TableCell>
                    {disciplines.map(discipline => (
                      <TableCell key={discipline} sx={{ minWidth: 100, fontWeight: 'bold', textAlign: 'center' }}>
                        {discipline}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailedAgentStudentsData.length > 0 ? (
                    detailedAgentStudentsData.map((studentData, index) => (
                      <TableRow key={index}>
                        <TableCell>{studentData.studentEmail}</TableCell>
                        {disciplines.map(discipline => (
                          <TableCell key={discipline} align="center">
                            {studentData.disciplineCompletion[discipline] ? (
                              <Chip
                                icon={<CheckIcon />}
                                label="Concluído"
                                color="success"
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              <Chip
                                icon={<CloseIcon />}
                                label="Pendente"
                                color="error"
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={disciplines.length + 1} align="center">
                        Nenhum aluno encontrado para este agente.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        ) : (
          <>
            <DataTable data={filteredData} />
            <CompletedCourses data={filteredData} />
          </>
        )}

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
            color="primary"
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