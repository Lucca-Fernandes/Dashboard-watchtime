// src/pages/CompletedCourses.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import type { WatchTimeData } from '../types';
import { timeToSeconds } from '../utils/timeUtils'; // Importa a função timeToSeconds

// Totais predefinidos de aulas por disciplina
const predefinedTotals: { [key: string]: number } = {
  "Banco de Dados Relacional": 35,
  "Teste de Software Para Web": 22,
  "Desenvolvimento de APIs RESTful": 20,
  "Desenvolvimento Nativo para Android": 20,
  "Padrão de Projeto de Software": 20,
  "Programação Multiplataforma com Flutter": 39,
  "Programação Multiplataforma com React Native": 36,
  "React JS": 36,
  "Desenvolvimento de Interfaces Web Frameworks Front-End": 36,
  "Desenvolvimento de websites com mentalidade ágil": 34,
  "Fundamentos de Interface": 33,
  "Programação Intermediária com Python - Python II": 42,
  "Programação Orientada a Objetos": 39,
  "JavaScript": 35,
  "Linux": 38,
  "Introdução a Web": 47,
  "No Code": 36,
  "Scratch": 20,
  "Tutorial Plataforma": 4,
  "Projetos II": 16,
  "Programação Básica com Python": 59
};

// Mapeamento de variações de nomes para nomes predefinidos
const courseNameMappings: { [key: string]: string } = {
  "Banco de Dados": "Banco de Dados Relacional",
};

interface CourseStats {
  courseName: string;
  completedLessons: number;
  totalLessons: number;
}

interface StudentStats {
  email: string;
  fullName: string;
  courses: CourseStats[];
}

const CompletedCourses: React.FC<{ data: WatchTimeData[] }> = ({ data }) => {
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);

  useEffect(() => {
    if (searchEmail.trim() === '') {
      setStudentStats(null);
      return;
    }

    const email = searchEmail.toLowerCase();
    
    // Filtra todos os itens do aluno para processamento posterior
    const studentItems = data.filter(item => item.user_email.toLowerCase() === email);

    if (studentItems.length > 0) {
      const emailMap = new Map<string, { fullName: string; courses: Map<string, CourseStats> }>();
      
      // Itera sobre todos os itens do aluno (não apenas os com completed_date, pois a lógica de conclusão mudou)
      studentItems.forEach((item) => {
        if (!emailMap.has(email)) {
          emailMap.set(email, { fullName: item.user_full_name, courses: new Map() });
        }
        const student = emailMap.get(email)!;
        const normalizedCourseName = courseNameMappings[item.course_name] || item.course_name;
        
        // Garante que o objeto CourseStats para esta disciplina existe no mapa
        if (!student.courses.has(normalizedCourseName)) {
            student.courses.set(normalizedCourseName, {
                courseName: normalizedCourseName,
                completedLessons: 0, // Inicializa como 0
                totalLessons: predefinedTotals[normalizedCourseName] || 0 // Pega o total predefinido
            });
        }
      });

      // Agora, recalcula completedLessons com a nova lógica
      // Para cada disciplina do aluno, filtre os itens que satisfazem a nova lógica de conclusão
      const currentStudentStats = emailMap.get(email)!;
      currentStudentStats.courses.forEach((courseStat, courseKey) => {
          let countCompletedLessons = 0;
          // Filtra os itens do aluno para esta disciplina específica
          const disciplineItems = studentItems.filter(item => 
              (courseNameMappings[item.course_name] || item.course_name) === courseKey
          );

          disciplineItems.forEach(item => {
              const videoTotalSeconds = timeToSeconds(item.video_total_duration);
              const totalSecondsWatched = timeToSeconds(item.total_duration);

              const isLessonCompletedByDuration = 
                  videoTotalSeconds > 0 && // Garante que a duração total do vídeo é válida e positiva
                  totalSecondsWatched >= (videoTotalSeconds * 0.5);
              
              if (isLessonCompletedByDuration) {
                  countCompletedLessons++;
              }
          });
          // Atualiza o número de aulas concluídas com base na nova lógica
          courseStat.completedLessons = countCompletedLessons; 
      });

      const studentData = {
        email: email,
        fullName: currentStudentStats.fullName,
        courses: Array.from(currentStudentStats.courses.values())
      };
      setStudentStats(studentData);
    } else {
      setStudentStats(null);
    }
  }, [searchEmail, data]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Disciplinas e Aulas Concluídas
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Buscar por Email"
          variant="outlined"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Digite o email do aluno"
          sx={{ mb: 2 }}
        />
        {searchEmail.trim() !== '' && studentStats && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">{studentStats.fullName} ({studentStats.email})</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Disciplina</TableCell>
                  <TableCell>Aulas Concluídas</TableCell>
                  <TableCell>Total de Aulas</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentStats.courses.map((course: CourseStats, index: number) => {
                  // Previne divisão por zero se totalLessons for 0
                  const completionRate = course.totalLessons > 0 ? (course.completedLessons / course.totalLessons) * 100 : 0;
                  const isCompleted = completionRate >= 80 && course.completedLessons > 0;
                  return (
                    <TableRow key={index}>
                      <TableCell>{course.courseName}</TableCell>
                      <TableCell>{course.completedLessons}</TableCell>
                      <TableCell>{course.totalLessons}</TableCell>
                      <TableCell style={{ color: isCompleted ? 'green' : 'inherit' }}>
                        {isCompleted ? 'Concluído' : ''}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
        {searchEmail.trim() !== '' && !studentStats && (
          <Typography>Nenhum dado encontrado para o email informado.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default CompletedCourses;