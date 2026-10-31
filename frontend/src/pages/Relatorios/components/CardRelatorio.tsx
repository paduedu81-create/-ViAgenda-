interface CardRelatorioProps {
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  onGerar: () => void;
}

  export function CardRelatorio({ titulo, descricao, icone, onGerar }: CardRelatorioProps) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          {/* container do ícone azul claro */}
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center mb-3.5">
            {icone}
          </div>

          {/* título e descrição */}
          <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1.5">
            {titulo}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            {descricao}
          </p>
        </div>

        {/* botão de ação */}
        <button
          onClick={onGerar}
          className="self-start px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Gerar relatório
        </button>
      </div>
    );
  }