import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Oportunidades from './pages/Oportunidades';
import Clientes from './pages/Clientes';
import Relatorios from './pages/Relatorios';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/oportunidades" element={<Oportunidades />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
