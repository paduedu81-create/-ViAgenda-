import { Bell } from 'lucide-react';
import { useState } from 'react';


export default function Header() {

  const [modalBell, setModalBell] = useState<boolean>(false)

  const showModalBell = () => {
    setModalBell(prev => !prev);
  }



  return (
    <header className="bg-white border-b border-slate-100 h-20 px-8 flex items-center justify-between shrink-0">

      {/* Saudação */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Bom dia, Antônio! 👋
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Aqui estão as oportunidades que precisam da sua atenção hoje.
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <button
            onClick={showModalBell}
            className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-priority-alta text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              2
            </span>
          </button>

          {/* Notificações */}
          {modalBell && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
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
        {/* Usuário */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1D5BD8] text-white font-bold text-sm flex items-center justify-center shadow-sm">
            AN
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900 leading-tight">Antônio</p>
            <p className="text-xs text-slate-400">Vendedor</p>
          </div>
        </div>
      </div>
    </header>
  );
}
