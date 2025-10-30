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
  const { data, setData } = useData();
  const [filteredData, setFilteredData] = useState<WatchTimeData[]>([]);
  const [inputEmail, setInputEmail] = useState<string>('');
  const [showFileUploadInput, setShowFileUploadInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDashboard, setShowDashboard] = useState<boolean>(false); // NOVO: controla exibição
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
      "Fundamentos de Interface", "Desenvolvimento de websites com mentalidade ágil",
      "Desenvolvimento de Interfaces Web Frameworks Front-End", "React JS",
      "Programação Multiplataforma com React Native", "Programação Multiplataforma com Flutter"
    ],
    "Módulo 4: Avançado e Ferramentas": [
      "Padrão de Projeto de Software", "Desenvolvimento Nativo para Android",
      "Desenvolvimento de APIs RESTful", "Teste de Software Para Web"
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

  // Atualiza filteredData quando data mudar
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Carrega CSVs de notas
  useEffect(() => {
    const loadAllGrades = async () => {
      const loadedData: { [discipline: string]: GradeData[] } = {};
      for (const [discipline, csvPath] of Object.entries(disciplineCsvMap)) {
        try {
          const response = await fetch(csvPath);
          if (!response.ok) continue;
          const csvText = await response.text();
          const results = Papa.parse<GradeData>(csvText, {
            header: true,
            delimiter: ';',
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
          });
          loadedData[discipline] = results.data.filter(item => item && item['Usuário']);
        } catch (err) {
          console.error(`Erro ao carregar ${discipline}:`, err);
        }
      }
      setGradesDataMap(loadedData);
    };
    loadAllGrades();
  }, []);

  // CARREGA CSV PADRÃO
  const handleLoadPredefinedCsv = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/relatorio_watchtime_padrao.csv'); // CAMINHO CORRETO
      if (!response.ok) throw new Error('Arquivo não encontrado');
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data as WatchTimeData[];
          if (parsedData.length > 0) {
            setData(parsedData);
            setShowDashboard(true);
          } else {
            alert('CSV vazio ou inválido.');
          }
          setIsLoading(false);
        },
        error: () => {
          alert('Erro ao ler CSV.');
          setIsLoading(false);
        },
      });
    } catch (error) {
      alert('Erro ao carregar CSV padrão.');
      setIsLoading(false);
    }
  };

  // UPLOAD MANUAL
  const handleFileUpload = (uploadedData: WatchTimeData[]) => {
    if (uploadedData.length === 0) {
      alert('CSV vazio ou inválido.');
      return;
    }
    setData(uploadedData);
    setShowDashboard(true);
    setShowFileUploadInput(false);
  };

  // BUSCA POR ALUNO
  const handleSearch = () => {
    const email = inputEmail.toLowerCase();
    const filtered = data.filter(item =>
      item.user_email.toLowerCase().includes(email)
    );
    setFilteredData(filtered);
  };

  // BUSCA POR NOTAS
  const handleGradeSearch = () => {
    if (!gradeSearchEmail.trim()) {
      setStudentGrades([]);
      return;
    }
    const username = gradeSearchEmail.split('@')[0].toLowerCase();
    const grades: StudentGradesByDiscipline[] = [];
    Object.keys(disciplineCsvMap).forEach(discipline => {
      const disciplineData = gradesDataMap[discipline] || [];
      const found = disciplineData.find(item =>
        item['Usuário']?.trim().toLowerCase() === username
      );
      const nota = found ? found['Nota total (%)'] : null;
      let status: 'Aprovado' | 'Reprovado' | 'Não Encontrado' = 'Não Encontrado';
      if (nota && nota.trim()) {
        status = parseFloat(nota.replace(',', '.')) >= 60 ? 'Aprovado' : 'Reprovado';
      }
      grades.push({ discipline, nota, status });
    });
    setStudentGrades(grades);
  };

  // BUSCA POR AGENTE
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
              watchedLessons.add(item.video_name);
            }
          });

        const isCompletedByWatchTime = totalLessonsForDiscipline > 0 && (watchedLessons.size / totalLessonsForDiscipline) >= 0.8;

        const gradeData = gradesDataMap[discipline] || [];
        const studentGradeInfo = gradeData.find(item =>
          item['Usuário']?.trim().toLowerCase() === studentUsername
        );
        let isCompletedByGrade = false;
        if (studentGradeInfo?.['Nota total (%)']) {
          const nota = parseFloat(studentGradeInfo['Nota total (%)'].replace(',', '.'));
          if (!isNaN(nota) && nota >= 60) isCompletedByGrade = true;
        }

        disciplineCompletion[discipline] = isCompletedByWatchTime || isCompletedByGrade;
      });

      detailedData.push({ studentEmail, disciplineCompletion });
    });

    setDetailedAgentStudentsData(detailedData);
  };

  const handleManagementClick = () => {
    navigate('/gestao');
  };

  // RENDERIZAÇÃO
  return (
    <Box sx={{ p: 4, minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Dashboard de Watch Time
      </Typography>

      {/* ESTADO INICIAL: BOTÕES */}
      {!showDashboard ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mt: 8 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress />
              <Typography mt={2}>Carregando CSV...</Typography>
            </Box>
          ) : showFileUploadInput ? (
            <FileUpload onFileUpload={handleFileUpload} />
          ) : (
            <>
              <Typography variant="h6">Escolha uma opção:</Typography>
              <Button variant="contained" size="large" onClick={handleLoadPredefinedCsv} sx={{ width: 280 }}>
                Usar CSV Padrão
              </Button>
              <Button variant="outlined" size="large" onClick={() => setShowFileUploadInput(true)} sx={{ width: 280 }}>
                Carregar Novo CSV
              </Button>
            </>
          )}
        </Box>
      ) : (
        /* DASHBOARD COMPLETO */
        <Box sx={{ width: '100%' }}>
          {/* FILTROS */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                label="Filtrar por email do aluno"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                sx={{ flex: 1, minWidth: 250 }}
              />
              <Button variant="contained" onClick={handleSearch}>Buscar Aluno</Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Buscar por email do agente"
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                sx={{ flex: 1, minWidth: 250 }}
              />
              <Button variant="contained" onClick={handleAgentSearch}>Buscar Agente</Button>
            </Box>
          </Paper>

          {/* TABELA DE AGENTES */}
          {detailedAgentStudentsData ? (
            <Paper sx={{ p: 3, mb: 4, overflowX: 'auto' }}>
              <Typography variant="h5" gutterBottom>Conclusão por Aluno (Agente: {agentEmail})</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 320 }}>Aluno</TableCell>
                    {disciplines.map(d => (
                      <TableCell key={d} align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>{d}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailedAgentStudentsData.map((s, i) => {
                    const ok = Object.values(s.disciplineCompletion).filter(Boolean).length;
                    const no = disciplines.length - ok;
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" noWrap>{s.studentEmail}</Typography>
                            <Stack direction="row" spacing={0.5}>
                              <Chip icon={<CheckIcon />} label={ok} color="success" size="small" />
                              <Chip icon={<CloseIcon />} label={no} color="error" size="small" />
                            </Stack>
                          </Stack>
                        </TableCell>
                        {disciplines.map(d => (
                          <TableCell key={d} align="center">
                            {s.disciplineCompletion[d] ? (
                              <Chip icon={<CheckIcon />} label="OK" color="success" size="small" />
                            ) : (
                              <Chip icon={<CloseIcon />} label="—" color="error" size="small" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          ) : (
            <>
              <DataTable data={filteredData} />
              <CompletedCourses data={filteredData} />
            </>
          )}

          {/* NOTAS */}
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom>Notas por Disciplina</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Email do aluno"
                value={gradeSearchEmail}
                onChange={(e) => setGradeSearchEmail(e.target.value)}
              />
              <Button variant="contained" onClick={handleGradeSearch}>Buscar</Button>
            </Box>
            {studentGrades.length > 0 && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Disciplina</TableCell>
                    <TableCell>Nota</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentGrades.map((g, i) => (
                    <TableRow key={i}>
                      <TableCell>{g.discipline}</TableCell>
                      <TableCell>{g.nota || '—'}</TableCell>
                      <TableCell>
                        {g.status === 'Aprovado' ? (
                          <Chip icon={<CheckIcon />} label="Aprovado" color="success" />
                        ) : g.status === 'Reprovado' ? (
                          <Chip icon={<CloseIcon />} label="Reprovado" color="error" />
                        ) : (
                          <Chip label="Não encontrado" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" size="large" onClick={handleManagementClick}>
              Ir para Gestão de Agentes
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;