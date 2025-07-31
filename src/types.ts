// src/types.ts
export interface WatchTimeData {
  id: string; 
  user_email: string;
  user_full_name: string; 
  lesson_name: string; 
  course_name: string;
  video_name: string; 
  total_duration: string; // Tempo que o aluno consumiu (Ex: "01:03:37")
  completed: string; 
  completed_date: string | null; 
  until_completed_duration: string; // Adicionado com base no cabeçalho do CSV, manter como string. (Ex: "00:17:06")
  video_total_duration: string; // NOVO CAMPO: Duração total do vídeo (Ex: "00:19:51")
  created_at: string; 
  updated_at: string; 
  export_date: string; 
  registration_code: string; 
  status: string; 
  ags: string; 
}

// Estes provavelmente deveriam estar em src/utils/constants.ts se forem usados em múltiplos locais.
// Verifique onde você tem predefinedTotals e courseNameMappings definidos para evitar duplicidade.
// Caso estejam aqui, mantenha-os. Caso contrário, remova-os e garanta que são importados de constants.ts.

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
// Note: courseNameMappings não está presente neste arquivo `types.ts` no seu contexto,
// então não vou incluí-lo aqui para evitar duplicação se já estiver em `constants.ts`.