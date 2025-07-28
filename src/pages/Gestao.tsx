import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useData } from '../context/DataContext';
import { predefinedTotals } from '../types'; // Ou '../utils/constants' se separado

const Gestao: React.FC = () => {
  const { data } = useData();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<string[]>([]);

  // Lista de disciplinas predefinidas
  const disciplines = [
    "Banco de Dados Relacional",
    "Teste de Software Para Web",
    "Desenvolvimento de APIs RESTful",
    "Desenvolvimento Nativo para Android",
    "Padrão de Projeto de Software",
    "Programação Multiplataforma com Flutter",
    "Programação Multiplataforma com React Native",
    "React JS",
    "Desenvolvimento de Interfaces Web Frameworks Front-End",
    "Desenvolvimento de websites com mentalidade ágil",
    "Fundamentos de Interface",
    "Programação Intermediária com Python",
    "Programação Orientada a Objetos",
    "JavaScript",
    "Linux",
    "Introdução a Web",
    "No Code",
    "Scratch",
    "Tutorial Plataforma",
    "Projetos II",
    "Programação Básica com Python"
  ];

  // Extrai os agentes únicos do CSV
  useEffect(() => {
    const uniqueAgents = [...new Set(data.map(item => item.ags).filter(ags => ags))];
    setAgents(uniqueAgents);
  }, [data]);

  // Calcula o número de alunos únicos que concluíram pelo menos 80% de uma disciplina
  const getCompletionCounts = (agent: string) => {
    const agentData = data.filter(item => item.ags === agent && item.completed_date); // Apenas com data de conclusão
    const counts: { [key: string]: number } = {};

    disciplines.forEach(discipline => {
      const totalLessons = predefinedTotals[discipline] || 0; // Total de aulas da disciplina
      if (totalLessons > 0) {
        // Agrupa por user_email e course_name para somar todas as aulas assistidas
        const studentProgress = agentData
          .filter(item => item.course_name === discipline)
          .reduce((acc, item) => {
            if (!acc[item.user_email]) {
              acc[item.user_email] = { lessonsWatched: 0, completed: item.completed === 'true' };
            }
            acc[item.user_email].lessonsWatched += 1; // Incrementa aulas assistidas por entrada
            return acc;
          }, {} as { [key: string]: { lessonsWatched: number; completed: boolean } });

        // Conta alunos únicos que atingiram pelo menos 80% de conclusão
        const completedStudents = Object.keys(studentProgress)
          .filter(email => {
            const progress = studentProgress[email];
            const completionRate = progress.lessonsWatched / totalLessons;
            return progress.completed && completionRate >= 0.8;
          });

        counts[discipline] = [...new Set(completedStudents)].length; // Alunos únicos
      } else {
        counts[discipline] = 0; // Se não houver total definido, considera 0
      }
    });

    return counts;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestão de Agentes de Sucesso
      </Typography>

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
        </Box>
      ) : (
        <Box>
          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() => setSelectedAgent(null)}
          >
            Voltar
          </Button>
          <Typography variant="h6">Disciplinas concluídas pelos alunos do agente de sucesso {selectedAgent}</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Disciplina</TableCell>
                <TableCell>Alunos Concluídos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disciplines.map(discipline => {
                const count = getCompletionCounts(selectedAgent)[discipline];
                return (
                  <TableRow key={discipline}>
                    <TableCell>{discipline}</TableCell>
                    <TableCell>{count}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default Gestao;