import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Oportunidades from './pages/Oportunidades';
import Clientes from './pages/Clientes';
import Relatorios from './pages/Relatorios';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* rota pública de login */}
          <Route path="/login" element={<Login />} />

          {/* rotas autenticadas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/oportunidades" element={<Oportunidades />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </Route>
          </Route>

          {/* rota a ser redirecionada em caminhos desconhecidos */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
