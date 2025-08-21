// src/types.ts
export interface WatchTimeData {
  id: string; 
  user_email: string;
  user_full_name: string; 
  lesson_name: string; 
  course_name: string;
  video_name: string; 
  total_duration: string; 
  completed: string; 
  completed_date: string | null; 
  until_completed_duration: string; 
  video_total_duration: string; 
  created_at: string; 
  updated_at: string; 
  export_date: string; 
  registration_code: string; 
  status: string; 
  ags: string; 
}


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
