import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

export default function ProtectedRoute() {
  const { estaAutenticado, carregando } = useAuth();

  // exibe tela de carregamento enquanto valida a sessão no storage
  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Carregando ViAgenda...</span>
        </div>
      </div>
    );
  }

  // redireciona para login caso não haja sessão ativa
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}