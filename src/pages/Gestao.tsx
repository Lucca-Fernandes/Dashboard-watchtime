import React, { useState, useMemo, useEffect } from 'react';
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
import Papa from 'papaparse';

// ... (Tipos de dados permanecem os mesmos)

type DisciplineCompletionDetail = {
  count: number;
  students: Set<string>;
};
type AgentCompletionResults = {
  [discipline: string]: DisciplineCompletionDetail;
};
type PreProcessedAgentData = {
  [agentEmail: string]: AgentCompletionResults;
};
type ModuleCompletionData = {
  module: string;
  totalStudents: number;
};
type DisciplineChartData = {
  discipline: string;
  concludedStudents: number;
};
interface GradeData {
  'Usuário': string;
  'Nota total (%)': string;
}

const checkUserEmailDomain = (email: string, domainFilter: 'all' | 'pditabira' | 'pdbomdespacho'): boolean => {
  if (domainFilter === 'all') {
    return (
      email.endsWith('@pditabira.com') ||
      email.endsWith('@pdbomdespacho.com.br') ||
      email.endsWith('@projetodesenvolve.com.br')
    );
  }
  return email.endsWith(`@${domainFilter}.com`) || email.endsWith(`@${domainFilter}.com.br`);
};

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
        <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 5, }}>
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

// GRÁFICO 1: LÓGICA SIMPLES (TOTAL DE ALUNOS COM ATIVIDADE)
const TotalStudentsModuleChart = ({ data }: { data: ModuleCompletionData[] }) => {
  if (!data || data.length === 0) {
    return <Typography variant="h6">Nenhum dado disponível para o dashboard de módulos.</Typography>;
  }
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Alcance Total de Alunos por Módulo (com ao menos uma aula assistida)
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 5, }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="module" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalStudents" fill="#cc0490" name="Alunos com Atividade">
            <LabelList dataKey="totalStudents" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// GRÁFICO 2: LÓGICA AVANÇADA (ALUNOS ATUALMENTE CURSANDO)
const ActiveStudentsModuleChart = ({ data }: { data: ModuleCompletionData[] }) => {
    if (!data || data.length === 0) {
      return <Typography variant="h6">Nenhum dado disponível para o dashboard de módulos.</Typography>;
    }
    return (
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Total de Alunos Atualmente Cursando por Módulo
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 5, }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="module" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalStudents" fill="#38761d" name="Alunos Cursando">
              <LabelList dataKey="totalStudents" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

const DisciplineModuleChart = ({ data, moduleName }: { data: DisciplineChartData[]; moduleName: string | null }) => {
  if (!moduleName || data.length === 0) {
    return null;
  }
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Alunos Concluídos por Disciplina no {moduleName} (Baseado em Aulas)
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 5, }}>
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

const DisciplineGradeModuleChart = ({ data, moduleName }: { data: DisciplineChartData[]; moduleName: string | null }) => {
  if (!moduleName || data.length === 0) {
    return null;
  }
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Alunos Concluídos por Disciplina no {moduleName} (Baseado em Notas)
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 5, }}>
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
  const [gradesDataMap, setGradesDataMap] = useState<{ [discipline: string]: GradeData[] }>({});

  const modules = useMemo(() => ({
    "Módulo 1: Fundamentos": ["Scratch", "No Code", "Introdução a Web", "Linux", "Programação Básica com Python"],
    "Módulo 2: Backend e Dados": ["JavaScript", "Programação Orientada a Objetos", "Programação Intermediária com Python - Python II", "Banco de Dados Relacional"],
    "Módulo 3: Frontend e Mobile": ["Fundamentos de Interface", "Desenvolvimento de websites com mentalidade ágil", "Desenvolvimento de Interfaces Web Frameworks Front-End", "React JS", "Programação Multiplataforma com React Native", "Programação Multiplataforma com Flutter"],
    "Módulo 4: Avançado e Ferramentas": ["Padrão de Projeto de Software", "Desenvolvimento Nativo para Android", "Desenvolvimento de APIs RESTful", "Teste de Software Para Web"],
    "Projetos e Outros": ["Projetos II", "Tutorial Plataforma"]
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
    const loadAllGrades = async () => {
      if (Object.keys(gradesDataMap).length > 0) return;
      const loadedData: { [discipline: string]: GradeData[] } = {};
      for (const [discipline, csvPath] of Object.entries(disciplineCsvMap)) {
        try {
          const response = await fetch(csvPath);
          if (!response.ok) throw new Error(`Failed to fetch ${csvPath}: ${response.statusText}`);
          const csvText = await response.text();
          const results = Papa.parse<GradeData>(csvText, { header: true, delimiter: ';', skipEmptyLines: true, transformHeader: (h) => h.trim() });
          loadedData[discipline] = results.data.filter(item => item && item['Usuário'] !== undefined && item['Nota total (%)'] !== undefined);
        } catch (error) {
          console.error(`Erro ao carregar CSV de ${discipline}:`, error);
          loadedData[discipline] = [];
        }
      }
      setGradesDataMap(loadedData);
    };
    loadAllGrades();
  }, []);

  const removedAgents = useMemo(() => (["gabrielrodrigues@projetodesenvolve.com.br", "lucca@projetodesenvolve.com.br", "esther@projetodesenvolve.com.br", "leandraramos@projetodesenvolve.com.br", "lorenzolima@projetodesenvolve.com.br", "gustavo.viera@projetodesenvolve.com.br", "emannuelcosta@projetodesenvolve.com.br", "jhulybastos@projetodesenvolve.com.br", "larissafelipe@projetodesenvolve.com.br", "gustavo.vieira@projetodesenvolve.com.br"]), []);

  const agents = useMemo(() => {
    if (!allWatchTimeData || allWatchTimeData.length === 0) return [];
    const uniqueAgents = [...new Set(allWatchTimeData.map(item => item.ags).filter(ags => ags))];
    return uniqueAgents.filter(agent => !removedAgents.includes(agent));
  }, [allWatchTimeData, removedAgents]);

  const preProcessedAgentCompletionData: PreProcessedAgentData | null = useMemo(() => {
    if (!isDataLoaded || allWatchTimeData.length === 0 || agents.length === 0) return null;
    const filteredData = allWatchTimeData.filter(item => { const status = item.status?.trim(); return status === 'Ativo' || status === 'EmRecuperacao' || status === 'Atencao'; });
    const groupedByAgent: { [agent: string]: WatchTimeData[] } = {};
    filteredData.forEach(item => { if (item.ags && agents.includes(item.ags) && checkUserEmailDomain(item.user_email, selectedDomainFilter)) { if (!groupedByAgent[item.ags]) { groupedByAgent[item.ags] = []; } groupedByAgent[item.ags].push(item); } });
    const allAgentResults: PreProcessedAgentData = {};
    agents.forEach(agent => {
      const agentResults: AgentCompletionResults = {};
      const agentData = groupedByAgent[agent] || [];
      const groupedByDiscipline: { [normalizedDiscipline: string]: WatchTimeData[] } = {};
      agentData.forEach(item => { const normalizedDiscipline = courseNameMappings[item.course_name] || item.course_name; if (!groupedByDiscipline[normalizedDiscipline]) { groupedByDiscipline[normalizedDiscipline] = []; } groupedByDiscipline[normalizedDiscipline].push(item); });
      disciplines.forEach((discipline: string) => {
        const normalizedDiscipline = courseNameMappings[discipline] || discipline;
        const totalLessons = predefinedTotals[normalizedDiscipline] || 0;
        if (totalLessons > 0) {
          const studentProgress: { [email: string]: Set<string> } = {};
          const disciplineSpecificAgentData = groupedByDiscipline[normalizedDiscipline] || [];
          disciplineSpecificAgentData.forEach(item => {
            const videoTotalSeconds = timeToSeconds(item.video_total_duration);
            const totalSecondsWatched = timeToSeconds(item.total_duration);
            const isLessonCompletedByDuration = videoTotalSeconds > 0 && totalSecondsWatched >= (videoTotalSeconds * 0.5);
            if (isLessonCompletedByDuration) { if (!studentProgress[item.user_email]) { studentProgress[item.user_email] = new Set(); } studentProgress[item.user_email].add(item.id); }
          });
          const completedStudents = Object.keys(studentProgress).filter(email => { const lessonsWatchedCount = studentProgress[email].size; const completionRate = lessonsWatchedCount / totalLessons; return completionRate >= 0.5; });
          agentResults[discipline] = { count: completedStudents.length, students: new Set(completedStudents) };
        } else {
          agentResults[discipline] = { count: 0, students: new Set() };
        }
      });
      allAgentResults[agent] = agentResults;
    });
    return allAgentResults;
  }, [allWatchTimeData, agents, disciplines, predefinedTotals, courseNameMappings, isDataLoaded, selectedDomainFilter]);

  const dashboardData = useMemo(() => {
    if (!preProcessedAgentCompletionData) return [];
    const newDashboardData = agents.map(agent => { const completionDetails = preProcessedAgentCompletionData[agent]; const totalConcluded = Object.values(completionDetails).reduce((sum, detail) => sum + detail.count, 0); return { agent: agent.split('@')[0], concludedStudents: totalConcluded }; });
    newDashboardData.sort((a, b) => b.concludedStudents - a.concludedStudents);
    return newDashboardData;
  }, [agents, preProcessedAgentCompletionData]);

  const filteredUsernames = useMemo(() => {
    const usernames = new Set<string>();
    allWatchTimeData.forEach(item => { if (checkUserEmailDomain(item.user_email, selectedDomainFilter)) { const username = item.user_email.split('@')[0].toLowerCase().trim(); usernames.add(username); } });
    return usernames;
  }, [allWatchTimeData, selectedDomainFilter]);
    
  const allDisciplineCompletionData = useMemo(() => {
    if (!isDataLoaded || allWatchTimeData.length === 0) return null;
    const filteredData = allWatchTimeData.filter(item => { const status = item.status?.trim(); return status === 'Ativo' || status === 'EmRecuperacao' || status === 'Atencao'; });
    const studentDisciplineProgress: { [email: string]: { [discipline: string]: Set<string> } } = {};
    filteredData.forEach(_item => { if (checkUserEmailDomain(_item.user_email, selectedDomainFilter)) { const _normalizedDiscipline = courseNameMappings[_item.course_name] || _item.course_name; const _userEmail = _item.user_email; const _videoTotalSeconds = timeToSeconds(_item.video_total_duration); const _totalSecondsWatched = timeToSeconds(_item.total_duration); const _isLessonCompletedByDuration = _videoTotalSeconds > 0 && _totalSecondsWatched >= (_videoTotalSeconds * 0.5); if (_isLessonCompletedByDuration) { if (!studentDisciplineProgress[_userEmail]) { studentDisciplineProgress[_userEmail] = {}; } if (!studentDisciplineProgress[_userEmail][_normalizedDiscipline]) { studentDisciplineProgress[_userEmail][_normalizedDiscipline] = new Set(); } studentDisciplineProgress[_userEmail][_normalizedDiscipline].add(_item.id); } } });
    const disciplineConcludedStudents: { [discipline: string]: Set<string> } = {};
    disciplines.forEach(d => disciplineConcludedStudents[d] = new Set());
    Object.entries(studentDisciplineProgress).forEach(([email, disciplinesWatched]) => { Object.entries(disciplinesWatched).forEach(([normalizedDiscipline, lessonsCompleted]) => { const totalLessonsForDiscipline = predefinedTotals[normalizedDiscipline] || 0; if (totalLessonsForDiscipline > 0) { const completionRate = lessonsCompleted.size / totalLessonsForDiscipline; if (completionRate >= 0.5) { disciplineConcludedStudents[normalizedDiscipline].add(email); } } }); });
    const finalDisciplineResults: { [key: string]: DisciplineCompletionDetail } = {};
    Object.entries(disciplineConcludedStudents).forEach(([discipline, studentsSet]) => { finalDisciplineResults[discipline] = { count: studentsSet.size, students: studentsSet }; });
    return finalDisciplineResults;
  }, [allWatchTimeData, disciplines, predefinedTotals, courseNameMappings, isDataLoaded, selectedDomainFilter]);
  
  const allDisciplineGradeCompletionData = useMemo(() => {
    const results: { [discipline: string]: { count: number } } = {};
    Object.keys(disciplineCsvMap).forEach(discipline => {
      const disciplineData = gradesDataMap[discipline] || [];
      const approvedStudents = new Set<string>();
      disciplineData.forEach(item => {
        const username = item['Usuário'] ? item['Usuário'].split('@')[0].trim().toLowerCase() : null;
        const nota = item['Nota total (%)'] ? item['Nota total (%)'].trim().replace(',', '.') : null;
        if (username && nota && !isNaN(parseFloat(nota)) && filteredUsernames.has(username)) {
            const grade = parseFloat(nota);
            if (grade >= 60) { approvedStudents.add(username); }
        }
      });
      results[discipline] = { count: approvedStudents.size };
    });
    return results;
  }, [gradesDataMap, filteredUsernames, disciplineCsvMap]);

  // CÁLCULO PARA GRÁFICO 1 (LÓGICA SIMPLES)
  const totalStudentsModuleData = useMemo(() => {
    if (!isDataLoaded || allWatchTimeData.length === 0) return [];
    const studentsByModule = new Map<string, Set<string>>();
    const filteredData = allWatchTimeData.filter(item => { const status = item.status?.trim(); return status === 'Ativo' || status === 'EmRecuperacao' || status === 'Atencao'; });
    filteredData.forEach(item => { if (checkUserEmailDomain(item.user_email, selectedDomainFilter)) { const normalizedCourseName = courseNameMappings[item.course_name] || item.course_name; for (const [moduleName, moduleDisciplines] of Object.entries(modules)) { if (moduleDisciplines.includes(normalizedCourseName)) { if (!studentsByModule.has(moduleName)) { studentsByModule.set(moduleName, new Set<string>()); } studentsByModule.get(moduleName)!.add(item.user_email); break; } } } });
    const chartData: ModuleCompletionData[] = Array.from(studentsByModule.entries()).map(([module, studentsSet]) => ({ module: module, totalStudents: studentsSet.size }));
    chartData.sort((a, b) => a.module.localeCompare(b.module));
    return chartData;
  }, [allWatchTimeData, modules, courseNameMappings, isDataLoaded, selectedDomainFilter]);

  // CÁLCULOS PARA GRÁFICO 2 (LÓGICA AVANÇADA)
  const allDisciplineGradeCompletionStudents = useMemo(() => {
    const results: Map<string, Set<string>> = new Map();
    Object.keys(disciplineCsvMap).forEach(discipline => {
      const disciplineData = gradesDataMap[discipline] || [];
      const approvedStudents = new Set<string>();
      disciplineData.forEach(item => {
        const userEmail = item['Usuário'] ? item['Usuário'].trim().toLowerCase() : null;
        if (!userEmail) return;
        let fullEmail = userEmail;
        if (!userEmail.includes('@')) {
            if (selectedDomainFilter === 'pditabira') fullEmail = `${userEmail}@pditabira.com`;
            else if (selectedDomainFilter === 'pdbomdespacho') fullEmail = `${userEmail}@pdbomdespacho.com.br`;
            else fullEmail = `${userEmail}@pditabira.com`;
        }
        const nota = item['Nota total (%)'] ? item['Nota total (%)'].trim().replace(',', '.') : null;
        if (fullEmail && nota && !isNaN(parseFloat(nota))) { if (parseFloat(nota) >= 60) { approvedStudents.add(fullEmail); } }
      });
      results.set(discipline, approvedStudents);
    });
    return results;
  }, [gradesDataMap, disciplineCsvMap, selectedDomainFilter]);

  const unifiedDisciplineCompletion = useMemo(() => {
    const unified: Map<string, Set<string>> = new Map();
    disciplines.forEach(discipline => {
      const studentsByClass = allDisciplineCompletionData?.[discipline]?.students || new Set<string>();
      const studentsByGrade = allDisciplineGradeCompletionStudents.get(discipline) || new Set<string>();
      const combinedStudents = new Set([...studentsByClass, ...studentsByGrade]);
      unified.set(discipline, combinedStudents);
    });
    return unified;
  }, [allDisciplineCompletionData, allDisciplineGradeCompletionStudents, disciplines]);
  
  const activeStudentsModuleData = useMemo(() => {
    if (!isDataLoaded || allWatchTimeData.length === 0 || !unifiedDisciplineCompletion) return [];
    const studentsWithActivityInModule = new Map<string, Set<string>>();
    const allActiveStudents = new Set<string>();
    const filteredData = allWatchTimeData.filter(item => { const status = item.status?.trim(); return (status === 'Ativo' || status === 'EmRecuperacao' || status === 'Atencao') && checkUserEmailDomain(item.user_email, selectedDomainFilter); });
    filteredData.forEach(item => {
      allActiveStudents.add(item.user_email);
      const normalizedCourseName = courseNameMappings[item.course_name] || item.course_name;
      for (const [moduleName, moduleDisciplines] of Object.entries(modules)) {
        if (moduleDisciplines.includes(normalizedCourseName)) { if (!studentsWithActivityInModule.has(moduleName)) { studentsWithActivityInModule.set(moduleName, new Set<string>()); } studentsWithActivityInModule.get(moduleName)!.add(item.user_email); break; }
      }
    });
    const moduleOrder = Object.keys(modules);
    const finalModuleCounts: { [module: string]: number } = {};
    moduleOrder.forEach(m => finalModuleCounts[m] = 0);
    for (const studentEmail of allActiveStudents) {
      let completedAllPrevious = true;
      for (const moduleName of moduleOrder) {
        const disciplinesInModule = modules[moduleName as keyof typeof modules];
        if (!completedAllPrevious) break;
        const hasActivity = studentsWithActivityInModule.get(moduleName)?.has(studentEmail);
        if (!hasActivity) continue;
        const hasCompletedCurrentModule = disciplinesInModule.every(disc => unifiedDisciplineCompletion.get(disc)?.has(studentEmail));
        if (hasCompletedCurrentModule) {
          completedAllPrevious = true;
        } else {
          finalModuleCounts[moduleName]++;
          break; 
        }
      }
    }
    const chartData: ModuleCompletionData[] = moduleOrder.map(moduleName => ({ module: moduleName, totalStudents: finalModuleCounts[moduleName] || 0 }));
    return chartData;
  }, [allWatchTimeData, modules, courseNameMappings, isDataLoaded, selectedDomainFilter, unifiedDisciplineCompletion]);

  const filteredDisciplineGradeChartData = useMemo(() => {
    if (!selectedModuleForChart || !allDisciplineGradeCompletionData) return [];
    const disciplinesInModule = modules[selectedModuleForChart as keyof typeof modules] || [];
    const chartData: DisciplineChartData[] = [];
    disciplinesInModule.forEach((discipline: string) => { const concludedCount = allDisciplineGradeCompletionData[discipline]?.count || 0; chartData.push({ discipline: discipline, concludedStudents: concludedCount }); });
    chartData.sort((a, b) => a.discipline.localeCompare(b.discipline));
    return chartData;
  }, [selectedModuleForChart, allDisciplineGradeCompletionData, modules]);
  
  const filteredDisciplineChartData = useMemo(() => {
    if (!selectedModuleForChart || !allDisciplineCompletionData) return [];
    const disciplinesInModule = modules[selectedModuleForChart as keyof typeof modules] || [];
    const chartData: DisciplineChartData[] = [];
    disciplinesInModule.forEach((discipline: string) => { const concludedCount = allDisciplineCompletionData[discipline]?.count || 0; chartData.push({ discipline: discipline, concludedStudents: concludedCount }); });
    chartData.sort((a, b) => a.discipline.localeCompare(b.discipline));
    return chartData;
  }, [selectedModuleForChart, allDisciplineCompletionData, modules]);

  const handleBackToDashboard = () => navigate('/');
  const handleDisciplineClick = (disciplineName: string) => setOpenDisciplineStudents(prev => (prev === disciplineName ? null : disciplineName));

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

      <DashboardChart data={dashboardData} />

      {/* RENDERIZAÇÃO DOS DOIS GRÁFICOS DE MÓDULO */}
      <TotalStudentsModuleChart data={totalStudentsModuleData} />
      <ActiveStudentsModuleChart data={activeStudentsModuleData} />

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
            onChange={(e: SelectChangeEvent<string | null>) => {
              const value = e.target.value === '' ? null : e.target.value;
              setSelectedModuleForChart(value);
            }}
          >
            <MenuItem value=""><em>Nenhum</em></MenuItem>
            {Object.keys(modules).map((moduleName) => (
              <MenuItem key={moduleName} value={moduleName}>{moduleName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <DisciplineModuleChart data={filteredDisciplineChartData} moduleName={selectedModuleForChart} />
        <DisciplineGradeModuleChart data={filteredDisciplineGradeChartData} moduleName={selectedModuleForChart} />
      </Paper>

      {!selectedAgent ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Selecione um Agente:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {dashboardData.map(agentData => (
              <Button key={agentData.agent} variant="outlined" sx={{ m: 0.5 }} onClick={() => setSelectedAgent(agentData.agent + "@projetodesenvolve.com.br")}>
                {agentData.agent}
              </Button>
            ))}
          </Box>
          <Button variant="contained" sx={{ mt: 2, ml: 1, alignSelf: 'flex-start' }} onClick={handleBackToDashboard}>
            Voltar ao Dashboard Principal
          </Button>
        </Box>
      ) : (
        <Box>
          <Button variant="outlined" sx={{ mb: 2 }} onClick={() => setSelectedAgent(null)}>
            Voltar à Lista de Agentes
          </Button>
          <Button variant="contained" sx={{ mb: 2, ml: 1 }} onClick={handleBackToDashboard}>
            Voltar ao Dashboard Principal
          </Button>
          <Typography variant="h6">Disciplinas concluídas pelos alunos do agente de sucesso {selectedAgent}</Typography>
          {Object.entries(modules).map(([moduleName, moduleDisciplines]) => (
            <Paper key={moduleName} sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">{moduleName}</Typography>
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
                        <TableCell align="right" sx={{ width: '120px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleDisciplineClick(discipline)}>
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
        <Dialog open onClose={() => setOpenDisciplineStudents(null)} maxWidth="sm" fullWidth>
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