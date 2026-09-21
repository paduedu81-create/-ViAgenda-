import { Send } from "lucide-react";
import { colors } from "../../../theme/colors";

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
    <div
      style={{ backgroundColor: colors.sidebar.background }}
      className="relative text-white rounded-3xl p-7 shadow-xl overflow-hidden select-none"
    >
      {/* Topo: Título + Data + Ícone de Avião */}
      <div className="flex items-start justify-between">
        <div>
          <span
            style={{ color: colors.sidebar.text }}
            className="text-[10px] font-extrabold tracking-[0.14em] uppercase block"
          >
            RESUMO DO DIA
          </span>
          <p
            style={{ color: colors.header.roleText }}
            className="text-[13px] font-medium mt-1"
          >
            {data}
          </p>
        </div>
        {/* Ícone de aviãozinho */}
        <div style={{ color: colors.brand.primary }}>
          <Send size={24} className="rotate-[-10deg]" />
        </div>
      </div>
      {/* Contatos Concluídos Hoje */}
      <div className="mt-4">
        <h3
          style={{ color: colors.text.inverted }}
          className="text-[42px] font-extrabold font-plus tracking-tight leading-none"
        >
          {contatosConcluidos}
        </h3>
        <p
          style={{ color: colors.sidebar.text }}
          className="text-xs mt-1"
        >
          contatos concluídos hoje
        </p>
      </div>

      {/* Linha Divisória Tracejada com Efeito de Ticket (Recortes nas laterais) */}
      <div className="relative my-6 flex items-center">
        {/* Recorte circular esquerdo */}
        <div className="absolute -left-8 w-6 h-6 rounded-full bg-[#F8F9FC] z-10"
        />

        {/* Linha tracejada do ticket */}
        <div className="border-b-2 border-dashed border-white/20 w-full" />

        {/* Recorte circular direito */}
        <div className="absolute -right-8 w-4 h-4 rounded-full bg-[#F8F9FC] z-10"
        />
      </div>

      {/* Grid das 3 Caixas de Prioridade */}
      <div className="grid grid-cols-3 gap-3">
        {/* ALTA */}
        <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-2 text-center">
          <p
            style={{ color: colors.priority.alta }}
            className="text-xl font-extrabold font-plus leading-tight">
            {totalAlta}
          </p>
          <span
            style={{ color: colors.sidebar.text }}
            className="text-[10px] font-bold uppercase tracking-wider block mt-1"
          >
            ALTA
          </span>
        </div>

        {/* MÉDIA */}
        <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-2 text-center">
          <p
            style={{ color: colors.priority.media }}
            className="text-xl font-extrabold font-plus leading-tight"
          >
            {totalMedia}
          </p>
          <span
            style={{ color: colors.sidebar.text }}
            className="text-[10px] font-bold uppercase tracking-wider block mt-1"
          >
            MÉDIA
          </span>
        </div>

        {/* BAIXA */}
        <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-2 text-center">
          <p
            style={{ color: colors.priority.baixa }}
            className="text-xl font-extrabold font-plus leading-tight"
          >
            {totalBaixa}
          </p>
          <span
            style={{ color: colors.sidebar.text }}
            className="text-[10px] font-bold uppercase tracking-wider block mt-1"
          >
            BAIXA
          </span>
        </div>
      </div>

      {/* Rodapé: Total do Dia */}
      <div className="flex items-center justify-between text-xs pt-5 font-medium">
        <span style={{ color: colors.sidebar.text }}>Total do dia</span>
        <span
          style={{ color: colors.text.inverted }}
          className="font-extrabold"
        >
          {totalOportunidades} oportunidades
        </span>
      </div>
    </div>
  );
}
