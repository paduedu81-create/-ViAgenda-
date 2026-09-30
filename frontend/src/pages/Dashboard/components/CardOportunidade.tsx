export interface Oportunidade {
  id: string | number;
  iniciais: string;
  nomeCliente: string;
  tipo: string; // 'Pós-viagem', 'Acompanhamento', 'Nova oportunidade'
  descricao: string;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  status: 'Aberta' | 'Em andamento' | 'Concluída' | 'Encerrada';
  dataCriacao: string;
  ultimoContato: string;
  contatoSugerido: string;
}

interface CardOportunidadeProps {
  oportunidade: Oportunidade;
  onVerCliente?: (id: string | number) => void;
  onRegistrarContato?: (id: string | number) => void;
}

export function CardOportunidade({
  oportunidade,
  onVerCliente,
  onRegistrarContato,
}: CardOportunidadeProps) {
  const prioridadeStyles = {
    ALTA: {
      borda: 'border-l-[#e11d48]',
      texto: 'text-[#e11d48]',
      dot: 'bg-[#e11d48]',
      avatarBg: 'bg-[#fdedf1]',
      avatarTexto: 'text-[#e11d48]',
    },
    MEDIA: {
      borda: 'border-l-[#d97706]',
      texto: 'text-[#d97706]',
      dot: 'bg-[#d97706]',
      avatarBg: 'bg-[#fdf3e2]',
      avatarTexto: 'text-[#d97706]',
    },
    BAIXA: {
      borda: 'border-l-[#16a34a]',
      texto: 'text-[#16a34a]',
      dot: 'bg-[#16a34a]',
      avatarBg: 'bg-[#e9f9ef]',
      avatarTexto: 'text-[#16a34a]',
    },
  }[oportunidade.prioridade];

  const statusStyles: Record<Oportunidade['status'], string> = {
    Aberta: 'bg-[#e8eefd] text-[#1d4ed8]',
    'Em andamento': 'bg-[#fdf3e2] text-[#d97706]',
    Concluída: 'bg-[#eef1f6] text-[#7c8aa0]',
    Encerrada: 'bg-[#eef1f6] text-[#7c8aa0]',
  };
  const estiloStatus = statusStyles[oportunidade.status] || 'bg-[#eef1f6] text-[#7c8aa0]';

  return (
    <div
      className={`flex gap-3.5 p-4 rounded-xl border border-[#e6eaf1] border-l-4 ${prioridadeStyles.borda} bg-white shadow-sm hover:shadow-md transition-all select-none`}
    >
      {/* Avatar */}
      <div
        className={`w-10.5 h-10.5 rounded-[11px] flex items-center justify-center font-extrabold text-[13.5px] shrink-0 ${prioridadeStyles.avatarBg} ${prioridadeStyles.avatarTexto}`}
      >
        {oportunidade.iniciais}
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 min-w-0">
        {/* Topo: Prioridade + Status + Data */}
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={`flex items-center gap-1.5 text-[10.5px] font-extrabold tracking-wider uppercase ${prioridadeStyles.texto}`}>
            <span className={`w-1.75 h-1.75 rounded-full ${prioridadeStyles.dot}`} />
            {oportunidade.prioridade}
          </span>

          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${estiloStatus}`}>
            {oportunidade.status}
          </span>

          <span className="text-[11.5px] text-sidebar-text">
            Criada em {oportunidade.dataCriacao}
          </span>
        </div>

        {/* Nome do Cliente */}
        <h4 className="font-extrabold text-[14.5px] text-[#0f1a2e] mt-0.5 leading-tight">
          {oportunidade.nomeCliente}
        </h4>

        {/* Tipo de Oportunidade */}
        <div className="text-[12px] text-[#1d4ed8] font-bold mt-0.5">
          {oportunidade.tipo}
        </div>

        {/* Descrição / Justificativa */}
        <p className="text-[12.8px] text-sidebar-footer mt-1.5 leading-[1.45]">
          {oportunidade.descricao}
        </p>

        {/* Último Contato */}
        <div className="text-[11.5px] text-sidebar-text mt-2">
          Último contato: {oportunidade.ultimoContato}
        </div>
      </div>

      {/* 3. Lado Direito (opp-side) */}
      <div className="flex flex-col items-end justify-between shrink-0 ml-1.5">
        {/* Contato sugerido */}
        <div className="text-right text-[11px] text-sidebar-footer">
          Contato sugerido
          <b className="block text-[12.5px] text-[#0f1a2e] font-extrabold">
            {oportunidade.contatoSugerido}
          </b>
        </div>

        {/* Linha de Botões (btn-row) */}
        <div className="flex items-center gap-2 mt-auto pt-3">
          <button
            onClick={() => onVerCliente?.(oportunidade.id)}
            className="rounded-[9px] border border-[#e6eaf1] bg-white px-3 py-1.5 text-[12.3px] font-bold text-[#0f1a2e] whitespace-nowrap hover:border-[#1d4ed8] hover:text-[#1d4ed8] transition-all cursor-pointer"
          >
            Ver cliente
          </button>

          <button
            onClick={() => onRegistrarContato?.(oportunidade.id)}
            className="rounded-[9px] border border-[#1d4ed8] bg-[#1d4ed8] px-3.5 py-1.5 text-[12.3px] font-bold text-white whitespace-nowrap hover:bg-[#1439a3] hover:border-[#1439a3] transition-all cursor-pointer shadow-sm"
          >
            Registrar contato
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardOportunidade;