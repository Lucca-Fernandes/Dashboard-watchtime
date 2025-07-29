// src/types.ts
export interface WatchTimeData {
  id: string; // Adicionado com base no cabeçalho do CSV
  user_email: string;
  user_full_name: string; // Adicionado com base no cabeçalho do CSV
  lesson_name: string; // Adicionado com base no cabeçalho do CSV
  course_name: string;
  video_name: string; // Adicionado com base no cabeçalho do CSV
  total_duration: string; // Manter como string devido ao formato de tempo
  completed: string; // 'true' ou 'false' (já ajustamos para toLowerCase() no Gestao.tsx)
  completed_date: string | null; // Data de conclusão, pode ser null
  until_completed_duration: string; // Adicionado com base no cabeçalho do CSV, manter como string
  created_at: string; // Adicionado com base no cabeçalho do CSV
  updated_at: string; // Adicionado com base no cabeçalho do CSV
  export_date: string; // Adicionado com base no cabeçalho do CSV
  registration_code: string; // Adicionado com base no cabeçalho do CSV
  status: string; // Adicionado com base no cabeçalho do CSV
  ags: string; // AGORA CORRIGIDO PARA ags (minúsculas) para corresponder ao CSV
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
// Note: courseNameMappings não está no snippet do seu types.ts, mas foi mencionado em constants.ts.
// Se ele estiver em constants.ts, mantenha-o lá e importe de lá.
/*
export const courseNameMappings: { [key: string]: string } = {
  "Banco de Dados": "Banco de Dados Relacional",
  "Programação Intermediária com Python": "Programação Intermediária com Python - Python II",
  // Adicione outros mapeamentos conforme necessário
};
*/