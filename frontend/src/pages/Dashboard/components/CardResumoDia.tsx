import { Send } from "lucide-react";

interface CardResumoDiaProps {
  data?: string;
  contatosConcluidos: number;
  totalAlta: number;
  totalMedia: number;
  totalBaixa: number;
  totalOportunidades: number;
}


export default function CardResumoDia({
  data,
  contatosConcluidos,
  totalAlta,
  totalMedia,
  totalBaixa,
  totalOportunidades
}: CardResumoDiaProps) {


  return (
    <div className="bg-[#0B132B] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden select-none">

      {/* Topo: Título + Data + Ícone de Avião */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            RESUMO DO DIA
          </span>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            {data}
          </p>
        </div>
        {/* Ícone de aviãozinho */}
        <div className="text-blue-500">
          <Send size={22} className="rotate-[-10deg]" />
        </div>
      </div>
      {/* Contatos Concluídos Hoje */}
      <div className="mt-4">
        <h3 className="text-4xl font-extrabold font-plus tracking-tight text-white">
          {contatosConcluidos}
        </h3>
        <p className="text-xs text-slate-300 mt-0.5">
          contatos concluídos hoje
        </p>
      </div>
      {/* Linha Divisória Tracejada com Efeito de Ticket (Recortes nas laterais) */}
      <div className="relative my-5">
        {/* Recorte circular esquerdo */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8F9FC] rounded-full" />

        {/* Linha pontilhada */}
        <div className="border-b border-dashed border-slate-700/80 w-full" />

        {/* Recorte circular direito */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8F9FC] rounded-full" />
      </div>
      {/* Grid das 3 Caixas de Prioridade */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* ALTA */}
        <div className="bg-[#131F3F]/70 rounded-2xl p-3 text-center border border-slate-800/50">
          <p className="text-lg font-bold font-plus text-rose-400 leading-tight">
            {totalAlta}
          </p>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
            ALTA
          </span>
        </div>
        {/* MÉDIA */}
        <div className="bg-[#131F3F]/70 rounded-2xl p-3 text-center border border-slate-800/50">
          <p className="text-lg font-bold font-plus text-amber-400 leading-tight">
            {totalMedia}
          </p>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
            MÉDIA
          </span>
        </div>
        {/* BAIXA */}
        <div className="bg-[#131F3F]/70 rounded-2xl p-3 text-center border border-slate-800/50">
          <p className="text-lg font-bold font-plus text-emerald-400 leading-tight">
            {totalBaixa}
          </p>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
            BAIXA
          </span>
        </div>
      </div>
      {/* Rodapé: Total do Dia */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-5 font-medium">
        <span>Total do dia</span>
        <span className="font-bold text-white">
          {totalOportunidades} oportunidades
        </span>
      </div>
    </div>
  );
}
