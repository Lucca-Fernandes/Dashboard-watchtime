// src/pages/Gestao.tsx
import React, { useState, useMemo } from 'react';
import {
  Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { useData } from '../context/DataContext';
import { predefinedTotals, courseNameMappings } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { timeToSeconds } from '../utils/timeUtils';
import type { WatchTimeData } from '../types';

// Definindo tipos para o novo formato de dados de conclusão por disciplina
type DisciplineCompletionDetail = {
  count: number;
  students: Set<string>;
};

type AgentCompletionResults = {
  [discipline: string]: DisciplineCompletionDetail;
};

// Novo tipo para dados de agente pré-processados
type PreProcessedAgentData = {
  [agentEmail: string]: AgentCompletionResults;
};

// Novo tipo para dados de módulo
type ModuleCompletionData = {
  module: string;
  totalStudents: number;
};

// Novo tipo para dados do gráfico de disciplina por módulo
type DisciplineChartData = {
  discipline: string;
  concludedStudents: number;
};

// Função auxiliar para verificar o domínio do email
const checkUserEmailDomain = (email: string, domainFilter: 'all' | 'pditabira' | 'pdbomdespacho'): boolean => {
  if (domainFilter === 'all') {
    return email.endsWith('@pditabira.com') || email.endsWith('@pdbomdespacho.com.br');
  }
  return email.endsWith(`@${domainFilter}.com`) || email.endsWith(`@${domainFilter}.com.br`);
};

// A função checkStudentStatus foi removida, pois não é mais utilizada.

const DashboardChart = ({ data }: { data: { agent: string; concludedStudents: number; }[] }) => {
  if (!data || data.length === 0) {
    return <Typography variant="h6">Nenhum dado disponível para o dashboard de agentes.</Typography>;
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Visão Geral de Conclusão por Agente
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 40,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="agent" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="concludedStudents" fill="#5231ef" name="Alunos Concluídos">
            <LabelList dataKey="concludedStudents" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Componente para o Gráfico de Módulos (Total de Alunos)
const ModuleChart = ({ data }: { data: ModuleCompletionData[] }) => {
  if (!data || data.length === 0) {
    return <Typography variant="h6">Nenhum dado disponível para o dashboard de módulos.</Typography>;
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Total de Alunos por Módulo (com pelo menos uma aula assistida)
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 40,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="module" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalStudents" fill="#cc0490" name="Alunos no Módulo">
            <LabelList dataKey="totalStudents" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};


// Componente para o Gráfico de Disciplinas por Módulo
const DisciplineModuleChart = ({ data, moduleName }: { data: DisciplineChartData[]; moduleName: string | null }) => {
  if (!moduleName || data.length === 0) {
    return <Typography variant="h6">Selecione um módulo para ver os detalhes das disciplinas.</Typography>;
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Alunos Concluídos por Disciplina no {moduleName}
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 40,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="discipline" angle={-45} textAnchor="end" height={80} interval={0} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="concludedStudents" fill="#292c37" name="Alunos Concluídos">
            <LabelList dataKey="concludedStudents" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};


const Gestao: React.FC = () => {
  const { data: allWatchTimeData, isDataLoaded } = useData();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [openDisciplineStudents, setOpenDisciplineStudents] = useState<string | null>(null);
  const [selectedModuleForChart, setSelectedModuleForChart] = useState<string | null>(null);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<'all' | 'pditabira' | 'pdbomdespacho'>('all');
  const navigate = useNavigate();

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

  const removedAgents = useMemo(() => ([
    "gabrielrodrigues@projetodesenvolve.com.br",
    "lucca@projetodesenvolve.com.br",
    "esther@projetodesenvolve.com.br",
    "leandraramos@projetodesenvolve.com.br",
    "lorenzolima@projetodesenvolve.com.br",
    "gustavo.viera@projetodesenvolve.com.br",
    "emannuelcosta@projetodesenvolve.com.br",
    "jhulybastos@projetodesenvolve.com.br",
    "larissafelipe@projetodesenvolve.com.br",
    "gustavo.vieira@projetodesenvolve.com.br"
  ]), []);

  const agents = useMemo(() => {
    if (!allWatchTimeData || allWatchTimeData.length === 0) {
      return [];
    }
    const uniqueAgents = [...new Set(allWatchTimeData.map(item => item.ags).filter(ags => ags))];
    return uniqueAgents.filter(agent => !removedAgents.includes(agent));
  }, [allWatchTimeData, removedAgents]);

  const preProcessedAgentCompletionData: PreProcessedAgentData | null = useMemo(() => {
    if (!isDataLoaded || allWatchTimeData.length === 0 || agents.length === 0) {
      return null;
    }

    const allAgentResults: PreProcessedAgentData = {};

    // INÍCIO DA ALTERAÇÃO: Filtrar os dados de acordo com os status desejados
    const filteredData = allWatchTimeData.filter(item => {
        const status = item.status?.trim();
        return status === 'Ativo' || status === 'EmRecuperacao' || status === 'Atencao';
    });
    // FIM DA ALTERAÇÃO

    const groupedByAgent: { [agent: string]: WatchTimeData[] } = {};
    filteredData.forEach(item => { // Alterado para usar filteredData
      if (item.ags && agents.includes(item.ags) && checkUserEmailDomain(item.user_email, selectedDomainFilter)) {
        if (!groupedByAgent[item.ags]) {
          groupedByAgent[item.ags] = [];
        }
        groupedByAgent[item.ags].push(item);
      }
    });

    agents.forEach(agent => {
      const agentResults: AgentCompletionResults = {};
      const agentData = groupedByAgent[agent] || [];

      const groupedByDiscipline: { [normalizedDiscipline: string]: WatchTimeData[] } = {};
      agentData.forEach(item => {
        const normalizedDiscipline = courseNameMappings[item.course_name] || item.course_name;
        if (!groupedByDiscipline[normalizedDiscipline]) {
          groupedByDiscipline[normalizedDiscipline] = [];
        }
        groupedByDiscipline[normalizedDiscipline].push(item);
      });

      disciplines.forEach((discipline: string) => {
        const normalizedDiscipline = courseNameMappings[discipline] || discipline;
        const totalLessons = predefinedTotals[normalizedDiscipline] || 0;

        if (totalLessons > 0) {
          const studentProgress: { [email: string]: Set<string> } = {};

          const disciplineSpecificAgentData = groupedByDiscipline[normalizedDiscipline] || [];

          disciplineSpecificAgentData.forEach(item => {
            const videoTotalSeconds = timeToSeconds(item.video_total_duration);
            const totalSecondsWatched = timeToSeconds(item.total_duration);

            const isLessonCompletedByDuration =
              videoTotalSeconds > 0 &&
              totalSecondsWatched >= (videoTotalSeconds * 0.5);

            if (isLessonCompletedByDuration) {
              if (!studentProgress[item.user_email]) {
                studentProgress[item.user_email] = new Set();
              }
              studentProgress[item.user_email].add(item.id);
            }
          });

          const completedStudents = Object.keys(studentProgress)
            .filter(email => {
              const lessonsWatchedCount = studentProgress[email].size;
              const completionRate = lessonsWatchedCount / totalLessons;
              return completionRate >= 0.5;
            });

          agentResults[discipline] = {
            count: completedStudents.length,
            students: new Set(completedStudents),
          };
        } else {
          agentResults[discipline] = {
            count: 0,
            students: new Set(),
          };
        }
      });
      allAgentResults[agent] = agentResults;
    });
    return allAgentResults;
  }, [allWatchTimeData, agents, disciplines, predefinedTotals, courseNameMappings, isDataLoaded, selectedDomainFilter]);

  const dashboardData = useMemo(() => {
    if (!preProcessedAgentCompletionData) {
      return [];
    }
    const newDashboardData = agents.map(agent => {
      const completionDetails = preProcessedAgentCompletionData[agent];
      const totalConcluded = Object.values(completionDetails).reduce((sum, detail) => sum + detail.count, 0);
      return {
        agent: agent.split('@')[0],
        concludedStudents: totalConcluded
      };
    });
    newDashboardData.sort((a, b) => b.concludedStudents - a.concludedStudents);
    return newDashboardData;
  }, [agents, preProcessedAgentCompletionData]);

  // Calcular Dados de Alunos por Módulo (todos os que assistiram alguma aula)
  const moduleData = useMemo(() => {
    if (!isDataLoaded || allWatchTimeData.length === 0) {
      return [];
    }

    const studentsByModule = new Map<string, Set<string>>();

    // INÍCIO DA ALTERAÇÃO: Filtrar os dados de acordo com os status desejados
    const filteredData = allWatchTimeData.filter(item => {
        const status = item.status?.trim();
        return status === 'Ativo' || status === 'EmRecuperacao' || status === 'Atencao';
    });
    // FIM DA ALTERAÇÃO

    filteredData.forEach(item => { // Alterado para usar filteredData
      if (checkUserEmailDomain(item.user_email, selectedDomainFilter)) {
        const normalizedCourseName = courseNameMappings[item.course_name] || item.course_name;

        for (const [moduleName, moduleDisciplines] of Object.entries(modules)) {
          if (moduleDisciplines.includes(normalizedCourseName)) {
            if (!studentsByModule.has(moduleName)) {
              studentsByModule.set(moduleName, new Set<string>());
            }
            studentsByModule.get(moduleName)!.add(item.user_email);
            break;
          }
        }
      }
    });

    const chartData: ModuleCompletionData[] = Array.from(studentsByModule.entries()).map(([module, studentsSet]) => ({
      module: module,
      totalStudents: studentsSet.size
    }));

    chartData.sort((a, b) => a.module.localeCompare(b.module));

    return chartData;
  }, [allWatchTimeData, modules, courseNameMappings, isDataLoaded, selectedDomainFilter]);

  // Pré-processamento dos dados de conclusão por disciplina para TODOS os alunos
  const allDisciplineCompletionData = useMemo(() => {
    if (!isDataLoaded || allWatchTimeData.length === 0) {
      return null;
    }
    
    // INÍCIO DA ALTERAÇÃO: Filtrar os dados de acordo com os status desejados
    const filteredData = allWatchTimeData.filter(item => {
        const status = item.status?.trim();
        return status === 'Ativo' || status === 'EmRecuperacao' || status === 'Atencao';
    });
    // FIM DA ALTERAÇÃO

    const studentDisciplineProgress: { [email: string]: { [discipline: string]: Set<string> } } = {};

    filteredData.forEach(_item => { // Alterado para usar filteredData
      if (checkUserEmailDomain(_item.user_email, selectedDomainFilter)) {
        const _normalizedDiscipline = courseNameMappings[_item.course_name] || _item.course_name;
        const _userEmail = _item.user_email;
        const _videoTotalSeconds = timeToSeconds(_item.video_total_duration);
        const _totalSecondsWatched = timeToSeconds(_item.total_duration);

        const _isLessonCompletedByDuration =
          _videoTotalSeconds > 0 &&
          _totalSecondsWatched >= (_videoTotalSeconds * 0.5);

        if (_isLessonCompletedByDuration) {
          if (!studentDisciplineProgress[_userEmail]) {
            studentDisciplineProgress[_userEmail] = {};
          }
          if (!studentDisciplineProgress[_userEmail][_normalizedDiscipline]) {
            studentDisciplineProgress[_userEmail][_normalizedDiscipline] = new Set();
          }
          studentDisciplineProgress[_userEmail][_normalizedDiscipline].add(_item.id);
        }
      }
    });

    const disciplineConcludedStudents: { [discipline: string]: Set<string> } = {};
    disciplines.forEach(d => disciplineConcludedStudents[d] = new Set());

    Object.entries(studentDisciplineProgress).forEach(([email, disciplinesWatched]) => {
      Object.entries(disciplinesWatched).forEach(([normalizedDiscipline, lessonsCompleted]) => {
        const totalLessonsForDiscipline = predefinedTotals[normalizedDiscipline] || 0;
        if (totalLessonsForDiscipline > 0) {
          const completionRate = lessonsCompleted.size / totalLessonsForDiscipline;
          if (completionRate >= 0.5) {
            disciplineConcludedStudents[normalizedDiscipline].add(email);
          }
        }
      });
    });

    const finalDisciplineResults: { [key: string]: DisciplineCompletionDetail } = {};
    Object.entries(disciplineConcludedStudents).forEach(([discipline, studentsSet]) => {
      finalDisciplineResults[discipline] = { count: studentsSet.size, students: studentsSet };
    });

    return finalDisciplineResults;
  }, [allWatchTimeData, disciplines, predefinedTotals, courseNameMappings, isDataLoaded, selectedDomainFilter]);


  // Filtrar dados para o gráfico de disciplina com base no módulo selecionado
  const filteredDisciplineChartData = useMemo(() => {
    if (!selectedModuleForChart || !allDisciplineCompletionData) {
      return [];
    }

    const disciplinesInModule = modules[selectedModuleForChart as keyof typeof modules] || [];
    const chartData: DisciplineChartData[] = [];

    disciplinesInModule.forEach((discipline: string) => {
      const concludedCount = allDisciplineCompletionData[discipline]?.count || 0;
      chartData.push({
        discipline: discipline,
        concludedStudents: concludedCount
      });
    });

    chartData.sort((a, b) => a.discipline.localeCompare(b.discipline));

    return chartData;
  }, [selectedModuleForChart, allDisciplineCompletionData, modules]);


  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleDisciplineClick = (disciplineName: string) => {
    setOpenDisciplineStudents(prev => (prev === disciplineName ? null : disciplineName));
  };

  if (!isDataLoaded || !preProcessedAgentCompletionData || !allDisciplineCompletionData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Carregando dados de gestão...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestão de Agentes de Sucesso e Módulos
      </Typography>

      {/* Filtro de Domínio */}
      <FormControl fullWidth sx={{ mb: 4, mt: 2 }}>
        <InputLabel id="domain-filter-label">Filtrar por Domínio</InputLabel>
        <Select
          labelId="domain-filter-label"
          id="domain-filter-select"
          value={selectedDomainFilter}
          label="Filtrar por Domínio"
          onChange={(e: SelectChangeEvent<string | null>) => setSelectedDomainFilter(e.target.value as 'all' | 'pditabira' | 'pdbomdespacho')}
        >
          <MenuItem value="all">Todos os Domínios (Itabira e Bom Despacho)</MenuItem>
          <MenuItem value="pditabira">Itabira</MenuItem>
          <MenuItem value="pdbomdespacho">Bom Despacho</MenuItem>
        </Select>
      </FormControl>
      {/* Fim Filtro de Domínio */}

      <DashboardChart data={dashboardData} />

      <ModuleChart data={moduleData} />

      {/* Filtro e Gráfico de Disciplinas por Módulo */}
      <Paper sx={{ p: 3, mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Alunos Concluídos por Disciplina (Filtrado por Módulo)
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="module-select-label">Selecionar Módulo</InputLabel>
          <Select
            labelId="module-select-label"
            id="module-select"
            value={selectedModuleForChart || ''}
            label="Selecionar Módulo"
            onChange={(e: SelectChangeEvent<string | null>) => setSelectedModuleForChart(e.target.value)}
          >
            <MenuItem value="">
              <em>Nenhum</em>
            </MenuItem>
            {Object.keys(modules).map((moduleName) => (
              <MenuItem key={moduleName} value={moduleName}>
                {moduleName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DisciplineModuleChart data={filteredDisciplineChartData} moduleName={selectedModuleForChart} />
      </Paper>
      {/* Fim Filtro e Gráfico de Disciplinas por Módulo */}

      {!selectedAgent ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Selecione um Agente:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {dashboardData.map(agentData => (
              <Button
                key={agentData.agent}
                variant="outlined"
                sx={{ m: 0.5 }}
                onClick={() => setSelectedAgent(agentData.agent + "@projetodesenvolve.com.br")}
              >
                {agentData.agent}
              </Button>
            ))}
          </Box>

          <Button
            variant="contained"
            sx={{ mt: 2, ml: 1, alignSelf: 'flex-start' }}
            onClick={handleBackToDashboard}
          >
            Voltar ao Dashboard Principal
          </Button>
        </Box>
      ) : (
        <Box>
          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() => setSelectedAgent(null)}
          >
            Voltar à Lista de Agentes
          </Button>

          <Button
            variant="contained"
            sx={{ mb: 2, ml: 1 }}
            onClick={handleBackToDashboard}
          >
            Voltar ao Dashboard Principal
          </Button>
          <Typography variant="h6">Disciplinas concluídas pelos alunos do agente de sucesso {selectedAgent}</Typography>

          {Object.entries(modules).map(([moduleName, moduleDisciplines]) => (
            <Paper key={moduleName} sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                {moduleName}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Disciplina</TableCell>
                    <TableCell align="right" sx={{ width: '120px' }}>Alunos Concluídos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moduleDisciplines.map((discipline: string) => {
                    const disciplineDetails = preProcessedAgentCompletionData[selectedAgent]?.[discipline];
                    const count = disciplineDetails ? disciplineDetails.count : 0;

                    return (
                      <TableRow key={discipline}>
                        <TableCell>{discipline}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ width: '120px', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => handleDisciplineClick(discipline)}
                        >
                          {count}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          ))}
        </Box>
      )}

      {selectedAgent && openDisciplineStudents && (
        <Dialog
          open
          onClose={() => setOpenDisciplineStudents(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Alunos Concluídos em "{openDisciplineStudents}"</DialogTitle>
          <DialogContent dividers>
            <List dense>
              {preProcessedAgentCompletionData[selectedAgent]?.[openDisciplineStudents]?.students.size > 0 ? (
                Array.from(preProcessedAgentCompletionData[selectedAgent][openDisciplineStudents]?.students || []).map((studentEmail, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText primary={studentEmail} />
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ p: 2 }}>Nenhum aluno encontrado para esta disciplina.</Typography>
              )}
            </List>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default Gestao;