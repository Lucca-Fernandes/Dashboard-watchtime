import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard'; // Renderiza o Dashboard como página inicial
import Gestao from '../pages/Gestao'; // Importa a página de Gestão

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Gestao" element={<Gestao />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;