// src/Gestao.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import { predefinedTotals, courseNameMappings } from '../utils/constants'; 
import { useNavigate } from 'react-router-dom'; 


const Dashboard = ({ data }: { data: { agent: string; concludedStudents: number; }[] }) => {
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
          <Bar dataKey="concludedStudents" fill="#8884d8" name="Alunos Concluídos" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};


const Gestao: React.FC = () => {
  const { data } = useData();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<string[]>([]);
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const navigate = useNavigate(); 

  // Define os módulos e suas disciplinas
  const modules = {
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
    "Projetos e Outros": [ // Módulo para disciplinas que não se encaixam nos 4 principais
      "Projetos II",
      "Tutorial Plataforma" 
    ]
  };

  // Gera uma lista plana de todas as disciplinas para uso em getCompletionCounts
  const disciplines = Object.values(modules).flat();

  // Lista de e-mails de agentes a serem removidos
  const removedAgents = [
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
  ];

  // Extrai os agentes únicos do CSV e remove os agentes desativados
  useEffect(() => {
    const uniqueAgents = [...new Set(data.map(item => item.ags).filter(ags => ags))];
    const filteredAgents = uniqueAgents.filter(agent => !removedAgents.includes(agent));
    setAgents(filteredAgents);
  }, [data]);

  // Calcula o número de alunos únicos que concluíram pelo menos 80% de uma disciplina
  const getCompletionCounts = (agent: string) => {
    const agentData = data.filter(item => item.ags === agent && item.completed_date);
    const counts: { [key: string]: number } = {};

   
    disciplines.forEach(discipline => { 
      const normalizedDiscipline = courseNameMappings[discipline] || discipline;
      const totalLessons = predefinedTotals[normalizedDiscipline] || 0;

      if (totalLessons > 0) {
        const studentProgress: { [email: string]: Set<string> } = {};

        const disciplineSpecificAgentData = agentData.filter(item => {
            const itemNormalizedCourseName = courseNameMappings[item.course_name] || item.course_name;
            const isCompletedTrue = item.completed?.toLowerCase() === 'true'; 
            return itemNormalizedCourseName === normalizedDiscipline && isCompletedTrue;
        });

        disciplineSpecificAgentData.forEach(item => {
            if (!studentProgress[item.user_email]) {
              studentProgress[item.user_email] = new Set();
            }
            studentProgress[item.user_email].add(item.id); 
        });

        const completedStudents = Object.keys(studentProgress)
          .filter(email => {
            const lessonsWatchedCount = studentProgress[email].size; 
            const completionRate = lessonsWatchedCount / totalLessons;
            return completionRate >= 0.8; 
          });

        counts[discipline] = [...new Set(completedStudents)].length; 
      } else {
        counts[discipline] = 0; 
      }
    });

    return counts;
  };
  
  
  useEffect(() => {
    const newDashboardData = agents.map(agent => {
      const completionCounts = getCompletionCounts(agent);
      const totalConcluded = Object.values(completionCounts).reduce((sum, count) => sum + count, 0);
      return {
        agent: agent.split('@')[0], 
        concludedStudents: totalConcluded
      };
    });
    setDashboardData(newDashboardData);
  }, [agents]);


  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestão de Agentes de Sucesso
      </Typography>

      <Dashboard data={dashboardData} />

      {/* Condição para exibir a lista de agentes OU a visão detalhada do agente */}
      {!selectedAgent ? (
        <Box>
          <Typography variant="h6">Selecione um Agente:</Typography>
          {agents.map(agent => (
            <Button
              key={agent}
              variant="outlined"
              sx={{ m: 1 }}
              onClick={() => setSelectedAgent(agent)}
            >
              {agent}
            </Button>
          ))}
          
          <Button
            variant="contained"
            sx={{ mt: 2, ml: 1 }} 
            onClick={() => navigate('/')} 
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
            onClick={() => navigate('/')} 
          >
            Voltar ao Dashboard Principal
          </Button>
          <Typography variant="h6">Disciplinas concluídas pelos alunos do agente de sucesso {selectedAgent}</Typography>
          
          {/* Loop para exibir os módulos */}
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
                  {moduleDisciplines.map(discipline => {
                    const count = getCompletionCounts(selectedAgent)[discipline];
                    return (
                      <TableRow key={discipline}>
                        <TableCell>{discipline}</TableCell>
                        
                        <TableCell align="right" sx={{ width: '120px' }}>{count}</TableCell> 
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Gestao;