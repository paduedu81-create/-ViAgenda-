import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { api } from '../../../services/api';
import type { Oportunidade } from "../../Oportunidades/oportunidades.types";


interface CardOportunidadeProps {
  oportunidade: Oportunidade;
  onRegistrarContato?: (id: string | number) => void;
}

export function CardOportunidade({
  oportunidade,
  onRegistrarContato,
}: CardOportunidadeProps) {
  const [modalContato, setModalContato] = useState(false);
  const [canal, setCanal] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroContato, setErroContato] = useState('');
  const [contatoFeito, setContatoFeito] = useState(() => {
    try {
      const feitos = JSON.parse(localStorage.getItem('@viagenda:contatos-feitos') || '[]') as string[];
      return feitos.includes(String(oportunidade.id));
    } catch {
      return false;
    }
  });
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

  const navigate = useNavigate();

  // navega para a ficha do cliente vinculado
  const handleVerCliente = () => {
    navigate(`/clientes/${oportunidade.clienteId}`);
  };

  const registrarContato = async () => {
    if (!canal) return;
    setSalvando(true);
    setErroContato('');
    try {
      await api(`/contatos/${oportunidade.id}/registrar`, {
        method: 'POST',
        body: JSON.stringify({
          id_cliente: oportunidade.clienteId,
          canal,
          mensagem: `Contato realizado via ${canal}.`,
          resultado: 'Contato feito',
        }),
      });
      setContatoFeito(true);
      const feitos = JSON.parse(localStorage.getItem('@viagenda:contatos-feitos') || '[]') as string[];
      localStorage.setItem('@viagenda:contatos-feitos', JSON.stringify([...new Set([...feitos, String(oportunidade.id)])]));
      setModalContato(false);
      onRegistrarContato?.(oportunidade.id);
    } catch (error) {
      setErroContato(error instanceof Error ? error.message : 'Não foi possível registrar o contato.');
    } finally {
      setSalvando(false);
    }
  };

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
            onClick={handleVerCliente}
            className="rounded-[9px] border border-[#e6eaf1] bg-white px-3 py-1.5 text-[12.3px] font-bold text-[#0f1a2e] whitespace-nowrap hover:border-[#1d4ed8] hover:text-[#1d4ed8] transition-all cursor-pointer"
          >
            Ver cliente
          </button>

          <button
            onClick={() => !contatoFeito && setModalContato(true)}
            disabled={contatoFeito}
            className={`rounded-[9px] border px-3.5 py-1.5 text-[12.3px] font-bold whitespace-nowrap transition-all shadow-sm ${contatoFeito ? 'border-emerald-600 bg-emerald-600 text-white cursor-not-allowed' : 'border-[#1d4ed8] bg-[#1d4ed8] text-white hover:bg-[#1439a3] hover:border-[#1439a3] cursor-pointer'}`}
          >
            {contatoFeito ? 'Contato feito!' : 'Registrar contato'}
          </button>
        </div>
      </div>
      {modalContato && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalContato(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby={`contato-titulo-${oportunidade.id}`} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id={`contato-titulo-${oportunidade.id}`} className="text-lg font-bold text-slate-900">Registrar contato</h2>
            <p className="mt-1 text-sm text-slate-500">Como o contato com {oportunidade.nomeCliente} foi realizado?</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {['WhatsApp', 'E-mail', 'Telefone', 'Presencial'].map((opcao) => (
                <button key={opcao} type="button" onClick={() => setCanal(opcao)} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${canal === opcao ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}>{opcao}</button>
              ))}
            </div>
            {erroContato && <p role="alert" className="mt-3 text-sm text-red-600">{erroContato}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setModalContato(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
              <button type="button" onClick={registrarContato} disabled={!canal || salvando} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{salvando ? 'Salvando...' : 'Confirmar contato'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default CardOportunidade;
