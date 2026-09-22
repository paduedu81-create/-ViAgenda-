import { ArrowRight } from 'lucide-react';
import { colors } from '../../../theme/colors';

export interface ProximoContato {
  id: string | number;
  nomeCliente: string;
  tipo: string;
  dia: string | number;
  mes: string;
  horario: string;
}

interface CardProximosContatosProps {
  contatos?: ProximoContato[];
  onVerAgenda?: () => void;
  onSelecionarContato?: (contato: ProximoContato) => void;
}

export function CardProximosContatos({
  contatos = [],
  onVerAgenda,
  onSelecionarContato,
}: CardProximosContatosProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden select-none">

      <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100">
        <h3
          style={{ color: colors.text.primary }}
          className="font-extrabold font-plus text-[15.5px]"
        >
          Próximos contatos
        </h3>

        <button
          type="button"
          onClick={onVerAgenda}
          style={{ color: colors.brand.primary }}
          className="text-[12.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer group hover:opacity-80"
        >
          <span>Ver agenda</span>
          <ArrowRight
            size={13}
            className="stroke-[2.5] transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {/* Lista de Contatos */}
      <div className="p-3 space-y-1">
        {contatos.length === 0 ? (
          <div
            style={{ color: colors.text.muted }}
            className="py-8 text-center text-xs"
          >
            Nenhum contato agendado.
          </div>
        ) : (
          contatos.map((contato) => (
            <div
              key={contato.id}
              onClick={() => onSelecionarContato?.(contato)}
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div
                style={{
                  backgroundColor: colors.brand.primaryLight,
                  color: colors.brand.primary,
                }}
                className="w-11 h-11 rounded-[10px] flex flex-col items-center justify-center shrink-0 leading-none"
              >
                <span className="font-extrabold text-[14px] leading-tight">
                  {contato.dia}
                </span>
                <span className="text-[9.5px] font-bold tracking-wider uppercase mt-0.5">
                  {contato.mes}
                </span>
              </div>

              {/* Informações do Contato */}
              <div className="flex-1 min-w-0">
                <h4
                  style={{ color: colors.text.primary }}
                  className="font-bold text-[13.5px] leading-tight truncate group-hover:text-blue-600 transition-colors"
                >
                  {contato.nomeCliente}
                </h4>
                <p
                  style={{ color: colors.text.secondary }}
                  className="text-[12px] font-normal mt-0.5 truncate"
                >
                  {contato.tipo}
                </p>
              </div>

              {/* Horário */}
              <span
                style={{ color: colors.text.muted }}
                className="text-[11.5px] font-semibold shrink-0"
              >
                {contato.horario}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CardProximosContatos;
