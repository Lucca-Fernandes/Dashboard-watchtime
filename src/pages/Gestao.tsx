// src/pages/Gestao.tsx
import React, { useState, useMemo } from 'react';
import {
  Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import { predefinedTotals, courseNameMappings } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { timeToSeconds } from '../utils/timeUtils';
import type { WatchTimeData } from '../types'; // Import WatchTimeData type

// Definindo tipos para o novo formato de dados de conclusão por disciplina
type DisciplineCompletionDetail = {
  count: number;
  students: string[];
};

type AgentCompletionResults = {
  [discipline: string]: DisciplineCompletionDetail;
};

// New type for pre-processed agent data
type PreProcessedAgentData = {
  [agentEmail: string]: AgentCompletionResults;
};

const DashboardChart = ({ data }: { data: { agent: string; concludedStudents: number; }[] }) => { // Renamed to avoid conflict
  if (!data || data.length === 0) {
    return <Typography variant="h6">Nenhum dado disponível para o dashboard.</Typography>;
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
            top: 5,
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
          <Bar dataKey="concludedStudents" fill="#5231ef" name="Alunos Concluídos" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};


const Gestao: React.FC = () => {
  const { data: allWatchTimeData, isDataLoaded } = useData();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [openDisciplineStudents, setOpenDisciplineStudents] = useState<string | null>(null);
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
  }), []); // Memoize modules as well

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
    if (!allWatchTimeData || allWatchTimeData.length === 0) return [];
    const uniqueAgents = [...new Set(allWatchTimeData.map(item => item.ags).filter(ags => ags))];
    return uniqueAgents.filter(agent => !removedAgents.includes(agent));
  }, [allWatchTimeData, removedAgents]);

  // Pre-process all completion details once when data loads
  const preProcessedAgentCompletionData: PreProcessedAgentData | null = useMemo(() => {
    if (!isDataLoaded || allWatchTimeData.length === 0 || agents.length === 0) {
      return null;
    }

    const allAgentResults: PreProcessedAgentData = {};

    // Group data by agent and then by discipline
    const groupedByAgent: { [agent: string]: WatchTimeData[] } = {};
    allWatchTimeData.forEach(item => {
      if (item.ags && agents.includes(item.ags)) { // Only include relevant agents
        if (!groupedByAgent[item.ags]) {
          groupedByAgent[item.ags] = [];
        }
        groupedByAgent[item.ags].push(item);
      }
    });

    agents.forEach(agent => {
      const agentResults: AgentCompletionResults = {};
      const agentData = groupedByAgent[agent] || [];

      // Group agent's data by normalized discipline
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
              totalSecondsWatched >= (videoTotalSeconds * 0.8);

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
              return completionRate >= 0.8;
            });

          agentResults[discipline] = {
            count: completedStudents.length,
            students: completedStudents,
          };
        } else {
          agentResults[discipline] = {
            count: 0,
            students: [],
          };
        }
      });
      allAgentResults[agent] = agentResults;
    });
    return allAgentResults;
  }, [allWatchTimeData, agents, disciplines, predefinedTotals, courseNameMappings, isDataLoaded]);


  const dashboardData = useMemo(() => {
    if (!preProcessedAgentCompletionData) return [];
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

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleDisciplineClick = (disciplineName: string) => {
    setOpenDisciplineStudents(prev => (prev === disciplineName ? null : disciplineName));
  };

  if (!isDataLoaded || !preProcessedAgentCompletionData) { // Also check for preProcessedAgentCompletionData
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
        Gestão de Agentes de Sucesso
      </Typography>

      <DashboardChart data={dashboardData} /> {/* Use the renamed component */}

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
                    // Access pre-calculated data
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
              {preProcessedAgentCompletionData[selectedAgent]?.[openDisciplineStudents]?.students.length > 0 ? (
                preProcessedAgentCompletionData[selectedAgent][openDisciplineStudents]?.students.map((studentEmail, index) => (
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