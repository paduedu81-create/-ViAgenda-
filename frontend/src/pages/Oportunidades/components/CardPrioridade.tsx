interface CardPrioridadeProps {
  label: string;
  valor: number;
  corDot: string;
}

export function CardPrioridade({ label, valor, corDot }: CardPrioridadeProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* bolinha que indica a prioridade */}
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${corDot}`} />
      <div>
        {/* valor da contagem */}
        <span className="block text-xl font-extrabold text-slate-900 leading-tight">
          {valor}
        </span>
        {/* rótulo descritivo */}
        <span className="text-xs font-semibold text-slate-500">
          {label}
        </span>
      </div>
    </div>
  );
}

export default CardPrioridade;
