import { Bell, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

export default function Header() {
  const [modalBell, setModalBell] = useState<boolean>(false);
  const { usuario, logout } = useAuth();
  const location = useLocation();

  const showModalBell = () => {
    setModalBell((prev) => !prev);
  };

  // função que pega saudação conforme o horário
  const obterSaudacao = (): string => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) {
      return 'Bom dia';
    }
    if (hora >= 12 && hora < 18) {
      return 'Boa tarde';
    }
    return 'Boa noite';
  };

  const saudacao = obterSaudacao();
  const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Antônio';

  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/oportunidades':
        return {
          titulo: 'Oportunidades',
          subtitulo: 'Todas as oportunidades comerciais identificadas pelo sistema.',
        };
      case '/clientes':
        return {
          titulo: 'Clientes',
          subtitulo: 'Carteira completa de clientes cadastrados.',
        };
      case '/relatorios':
        return {
          titulo: 'Relatórios',
          subtitulo: 'Relatórios pré-prontos. Escolha um período e gere o resultado.',
        };
      default: // esse é o do /dashboard
        return {
          titulo: `${saudacao}, ${primeiroNome}! 👋`,
          subtitulo: 'Aqui estão as oportunidades que precisam da sua atenção hoje.',
        };
    }
  };

  const { titulo, subtitulo } = getHeaderInfo();

  return (
    <header className="bg-white border-b border-slate-100 h-20 px-8 flex items-center justify-between shrink-0">
      {/* saudação e identificador da tela */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          {titulo}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {subtitulo}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <button
            onClick={showModalBell}
            className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-priority-alta text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              2
            </span>
          </button>

          {/* notificações */}
          {modalBell && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900">Notificações</h4>
                <span className="text-xs text-[#1D5BD8] font-semibold cursor-pointer">Marcar como lidas</span>
              </div>
              <div className="py-2 space-y-2 text-xs text-slate-600">
                <p className="p-2 rounded-lg bg-slate-50">🔔 <b>2 novos clientes</b> precisam de acompanhamento hoje.</p>
              </div>
            </div>
          )}
        </div>

        {/* dados do usuário autenticado */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
          <div className="w-10 h-10 rounded-full bg-[#1D5BD8] text-white font-bold text-sm flex items-center justify-center shadow-sm">
            {usuario?.iniciais || 'AS'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">
              {usuario?.nome || 'Antônio Silva'}
            </p>
            <p className="text-xs text-slate-400">
              {usuario?.cargo || 'Vendedor Comercial'}
            </p>
          </div>

          {/* botão de logout */}
          <button
            onClick={logout}
            title="Encerrar sessão"
            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 flex items-center justify-center transition-all cursor-pointer ml-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
