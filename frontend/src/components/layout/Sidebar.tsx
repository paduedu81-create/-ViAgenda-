import {
  LayoutDashboard,
  Target,
  Users,
  TrendingUp,
  Plane,
  Send
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Oportunidades', path: '/oportunidades', icon: Target, badge: 16 },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Relatórios', path: '/relatorios', icon: TrendingUp },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#0B132B] text-slate-400 h-screen flex flex-col justify-between p-5 select-none shrink-0">
      <div>

        {/* Logo VIAgenda */}
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-9 h-9 bg-[#1D5BD8] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-900/40">
            <Send size={18} className="rotate-[-20deg]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none tracking-wide">VIAgenda</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">AGT VIAGENS</span>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-[#1D5BD8] text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={19} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="min-w-5 h-5 px-1.5 bg-[#EF4444] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Rodapé */}
      <div className="pt-4 border-t border-slate-800/80 text-left px-2">
        <p className="text-[9px] tracking-widest uppercase text-slate-500 font-semibold">
          POWERED BY
        </p>
        <div className="flex items-center gap-1.5 text-white font-bold text-xs mt-1">
          <Plane size={13} className="rotate-45 text-white fill-white" />
          <span>AGT Viagens</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
