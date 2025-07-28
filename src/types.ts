// src/types.ts ou src/utils/constants.ts
export interface WatchTimeData {
  user_email: string;
  course_name: string;
  completed: string; // 'true' ou 'false'
  completed_date: string | null; // Data de conclusão, pode ser null
  AGS: string; // Agente de Sucesso
  [key: string]: any; // Para campos adicionais dinâmicos, se houver
}

// Totais predefinidos de aulas por disciplina
export const predefinedTotals: { [key: string]: number } = {
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
  "Programação Intermediária com Python": 42,
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