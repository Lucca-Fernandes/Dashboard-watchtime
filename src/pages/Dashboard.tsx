import { useState, useEffect, useMemo } from 'react';
import FileUpload from '../components/FileUpload';
import CompletedCourses from '../components/CompletedCourses';
import DataTable from '../components/DataTable';
import {
  Typography, Box, TextField, Button, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Chip, Stack
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

interface GradeData {
  'Usuário': string;
  'Nota total (%)': string;
}

interface StudentGradesByDiscipline {
  discipline: string;
  nota: string | null;
  status: 'Aprovado' | 'Reprovado' | 'Não Encontrado';
}

const Dashboard: React.FC = () => {
  const { data, setData, isDataLoaded } = useData();
  const [filteredData, setFilteredData] = useState<WatchTimeData[]>(data);
  const [inputEmail, setInputEmail] = useState<string>('');
  const [showFileUploadInput, setShowFileUploadInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const [agentEmail, setAgentEmail] = useState<string>('');
  const [detailedAgentStudentsData, setDetailedAgentStudentsData] = useState<DetailedStudentData[] | null>(null);
  const [gradesDataMap, setGradesDataMap] = useState<{ [discipline: string]: GradeData[] }>({});
  const [gradeSearchEmail, setGradeSearchEmail] = useState<string>('');
  const [studentGrades, setStudentGrades] = useState<StudentGradesByDiscipline[]>([]);

  const modules = useMemo(() => ({
    "Módulo 1: Fundamentos": [
      "Scratch", "No Code", "Introdução a Web", "Linux", "Programação Básica com Python"
    ],
    "Módulo 2: Backend e Dados": [
      "JavaScript", "Programação Orientada a Objetos", "Programação Intermediária com Python - Python II", "Banco de Dados Relacional"
    ],
    "Módulo 3: Frontend e Mobile": [
      "Fundamentos de Interface", "Desenvolvimento de websites com mentalidade ágil", "Desenvolvimento de Interfaces Web Frameworks Front-End", "React JS", "Programação Multiplataforma com React Native", "Programação Multiplataforma com Flutter"
    ],
    "Módulo 4: Avançado e Ferramentas": [
      "Padrão de Projeto de Software", "Desenvolvimento Nativo para Android", "Desenvolvimento de APIs RESTful", "Teste de Software Para Web"
    ],
  }), []);

  const disciplines = useMemo(() => Object.values(modules).flat(), [modules]);

  const disciplineCsvMap: { [discipline: string]: string } = {
    "Scratch": '/Modulo1/Scratch.csv',
    "No Code": '/Modulo1/NoCode.csv',
    "Introdução a Web": '/Modulo1/IntroducaoAWeb.csv',
    "Linux": '/Modulo1/Linux.csv',
    "Programação Básica com Python": '/Modulo1/ProgramacaoBasicaComPython.csv',
    "JavaScript": '/Modulo2/JavaScript.csv',
    "Programação Orientada a Objetos": '/Modulo2/ProgramacaoOrientadaAObjetos.csv',
    "Programação Intermediária com Python - Python II": '/Modulo2/ProgramacaoIntermediariaComPython.csv',
    "Banco de Dados Relacional": '/Modulo2/BancoDeDadosRelacional.csv',
    "Fundamentos de Interface": '/Modulo3/FundamentosDeInterface.csv',
    "Desenvolvimento de websites com mentalidade ágil": '/Modulo3/DesenvolvimentoDeWebsitesComMentalidadeAgil.csv',
    "Desenvolvimento de Interfaces Web Frameworks Front-End": '/Modulo3/DesenvolvimentoDeInterfacesWebFrameworksFrontEnd.csv',
    "React JS": '/Modulo3/ReactJS.csv',
    "Programação Multiplataforma com React Native": '/Modulo3/ProgramacaoMultiplataformaComReactNative.csv',
    "Programação Multiplataforma com Flutter": '/Modulo3/ProgramacaoMultiplataformaComFlutter.csv',
    "Padrão de Projeto de Software": '/Modulo4/PadraoDeProjetoDeSoftware.csv',
    "Desenvolvimento Nativo para Android": '/Modulo4/DesenvolvimentoNativoParaAndroid.csv',
    "Desenvolvimento de APIs RESTful": '/Modulo4/DesenvolvimentoDeAPIsRESTful.csv',
    "Teste de Software Para Web": '/Modulo4/TesteDeSoftwareParaWeb.csv',
  };

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    const loadAllGrades = async () => {
      const loadedData: { [discipline: string]: GradeData[] } = {};
      for (const [discipline, csvPath] of Object.entries(disciplineCsvMap)) {
        try {
          const response = await fetch(csvPath);
          if (!response.ok) {
            throw new Error(`Falha ao carregar ${csvPath}: ${response.statusText}`);
          }
          const csvText = await response.text();
          const results = Papa.parse<GradeData>(csvText, {
            header: true,
            delimiter: ';',
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
          });
          loadedData[discipline] = results.data.filter(item => item && item['Usuário'] !== undefined);
        } catch (error) {
          console.error(`Erro ao carregar CSV de ${discipline}:`, error);
        }
      }
      setGradesDataMap(loadedData);
    };
    loadAllGrades();
  }, []);

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

  const handleGradeSearch = () => {
    if (!gradeSearchEmail.trim()) {
      setStudentGrades([]);
      return;
    }
    const username = gradeSearchEmail.split('@')[0].toLowerCase();
    const grades: StudentGradesByDiscipline[] = [];
    Object.keys(disciplineCsvMap).forEach(discipline => {
      const disciplineData = gradesDataMap[discipline] || [];
      const foundStudent = disciplineData.find(item => 
        item && typeof item['Usuário'] === 'string' && item['Usuário'].trim().toLowerCase() === username
      );
      const nota = foundStudent ? foundStudent['Nota total (%)'] : null;
      let status: 'Aprovado' | 'Reprovado' | 'Não Encontrado' = 'Não Encontrado';
      if (nota !== null && nota.trim() !== '') {
        status = parseFloat(nota.replace(',', '.')) >= 60 ? 'Aprovado' : 'Reprovado';
      }
      grades.push({ discipline, nota, status });
    });
    setStudentGrades(grades);
  };

  const handleAgentSearch = () => {
    if (!agentEmail) {
      setDetailedAgentStudentsData(null);
      return;
    }
  
    const filteredByAgent = data.filter(item =>
      item.ags?.toLowerCase() === agentEmail.toLowerCase()
    );
  
    const allAgentStudents = new Set<string>(filteredByAgent.map(item => item.user_email));
    
    const detailedData: DetailedStudentData[] = [];
  
    allAgentStudents.forEach(studentEmail => {
      const disciplineCompletion: { [key: string]: boolean } = {};
      const studentUsername = studentEmail.split('@')[0].toLowerCase();
      const studentWatchData = filteredByAgent.filter(item => item.user_email === studentEmail);
  
      disciplines.forEach(discipline => {
        const normalizedDiscipline = courseNameMappings[discipline] || discipline;
        const totalLessonsForDiscipline = predefinedTotals[normalizedDiscipline] || 0;
        
        const watchedLessons = new Set<string>();
        studentWatchData
          .filter(item => (courseNameMappings[item.course_name] || item.course_name) === normalizedDiscipline)
          .forEach(item => {
            const videoTotalSeconds = timeToSeconds(item.video_total_duration);
            const totalSecondsWatched = timeToSeconds(item.total_duration);
            if (videoTotalSeconds > 0 && totalSecondsWatched >= (videoTotalSeconds * 0.5)) {
              watchedLessons.add(item.id);
            }
          });
  
        const isCompletedByWatchTime = totalLessonsForDiscipline > 0 && (watchedLessons.size / totalLessonsForDiscipline) >= 0.8;
  
        const gradeData = gradesDataMap[discipline] || [];
        const studentGradeInfo = gradeData.find(item => 
          item && typeof item['Usuário'] === 'string' && item['Usuário'].trim().toLowerCase() === studentUsername
        );
        let isCompletedByGrade = false;
        if (studentGradeInfo && studentGradeInfo['Nota total (%)']) {
          const nota = parseFloat(studentGradeInfo['Nota total (%)'].replace(',', '.'));
          if (!isNaN(nota) && nota >= 60) {
            isCompletedByGrade = true;
          }
        }
  
        disciplineCompletion[discipline] = isCompletedByWatchTime || isCompletedByGrade;
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
                    <TableCell sx={{ minWidth: 350, fontWeight: 'bold' }}>Aluno</TableCell>
                    {disciplines.map(discipline => (
                      <TableCell key={discipline} sx={{ minWidth: 100, fontWeight: 'bold', textAlign: 'center' }}>
                        {discipline}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailedAgentStudentsData.length > 0 ? (
                    detailedAgentStudentsData.map((studentData, index) => {
                      const completedCount = Object.values(studentData.disciplineCompletion).filter(Boolean).length;
                      const pendingCount = disciplines.length - completedCount;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {/* ** ALTERAÇÃO DE ESTILO APLICADA AQUI ** */}
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                              <Typography variant="body2" component="span" sx={{ whiteSpace: 'nowrap' }}>
                                {studentData.studentEmail}
                              </Typography>
                              <Stack direction="row" spacing={0.5}>
                                <Chip
                                  icon={<CheckIcon sx={{ fontSize: '1rem' }} />}
                                  label={completedCount}
                                  color="success"
                                  size="small"
                                  sx={{ height: '22px', fontSize: '0.7rem' }}
                                />
                                <Chip
                                  icon={<CloseIcon sx={{ fontSize: '1rem' }} />}
                                  label={pendingCount}
                                  color="error"
                                  size="small"
                                  sx={{ height: '22px', fontSize: '0.7rem' }}
                                />
                              </Stack>
                            </Stack>
                          </TableCell>
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
                      );
                    })
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

        <Paper sx={{ p: 3, mt: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Notas e Aprovação por Disciplina
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Buscar por email para notas"
              variant="outlined"
              fullWidth
              value={gradeSearchEmail}
              onChange={(e) => setGradeSearchEmail(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleGradeSearch}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Buscar Notas
            </Button>
          </Box>
          {gradeSearchEmail.trim() !== '' && (
            <Box sx={{ mt: 2 }}>
              {studentGrades.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Disciplina</TableCell>
                      <TableCell>Nota Total (%)</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentGrades.map((grade, index) => (
                      <TableRow key={index}>
                        <TableCell>{grade.discipline}</TableCell>
                        <TableCell>{grade.nota || 'N/A'}</TableCell>
                        <TableCell>
                          {grade.status === 'Aprovado' ? (
                            <Chip icon={<CheckIcon />} label="Aprovado" color="success" variant="outlined" />
                          ) : grade.status === 'Reprovado' ? (
                            <Chip icon={<CloseIcon />} label="Reprovado" color="error" variant="outlined" />
                          ) : (
                            <Chip label="Não Encontrado" color="default" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography sx={{ mt: 2 }}>
                  Nenhum dado de notas encontrado para este email.
                </Typography>
              )}
            </Box>
          )}
        </Paper>

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