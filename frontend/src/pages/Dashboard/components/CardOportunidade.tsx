import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { formatarDataBR } from '../../../utils/formatters';
import type { Oportunidade } from '../../Oportunidades/oportunidades.types';
import { CreditCard } from 'lucide-react';
import ModalRegistrarContato from '../../../components/modals/ModalRegistrarContato';

interface CardOportunidadeProps {
  oportunidade: Oportunidade;
  onRegistrarContato?: (id: string | number) => void;
  onEncerrarOportunidade?: (id: string | number) => void;
}

export function CardOportunidade({
  oportunidade,
  onRegistrarContato,
  onEncerrarOportunidade,
}: CardOportunidadeProps) {
  const navigate = useNavigate();

  // estados dos modais da tela
  const [modalContatoAberto, setModalContatoAberto] = useState(false);
  const [modalEncerrarAberto, setModalEncerrarAberto] = useState(false);

  // estado para encerramento
  const [salvandoEncerramento, setSalvandoEncerramento] = useState(false);
  const [erroEncerramento, setErroEncerramento] = useState('');

  // verifica se ja foi feito contato anteriormente
  const [contatoFeito, setContatoFeito] = useState(() => {
    try {
      const historico = localStorage.getItem('@viagenda:contatos-feitos');
      if (!historico) return false;
      const ids: string[] = JSON.parse(historico);
      return ids.includes(String(oportunidade.id));
    } catch {
      return false;
    }
  });

  // cores da borda e texto conforme prioridade
  function getCoresPrioridade() {
    if (oportunidade.prioridade === 'ALTA') {
      return {
        borda: 'border-l-rose-600',
        texto: 'text-rose-600',
        ponto: 'bg-rose-600',
        avatarFundo: 'bg-rose-50',
        avatarTexto: 'text-rose-600',
      };
    }
    if (oportunidade.prioridade === 'MEDIA') {
      return {
        borda: 'border-l-amber-600',
        texto: 'text-amber-600',
        ponto: 'bg-amber-600',
        avatarFundo: 'bg-amber-50',
        avatarTexto: 'text-amber-600',
      };
    }
    return {
      borda: 'border-l-emerald-600',
      texto: 'text-emerald-600',
      ponto: 'bg-emerald-600',
      avatarFundo: 'bg-emerald-50',
      avatarTexto: 'text-emerald-600',
    };
  }

  // cor do badge de status
  function getCorStatus() {
    if (oportunidade.status === 'Aberta') {
      return 'bg-blue-100 text-blue-700';
    }
    if (oportunidade.status === 'Em andamento') {
      return 'bg-amber-100 text-amber-700';
    }
    return 'bg-slate-100 text-slate-600';
  }

  // estilo do botao de contato
  function getEstiloBotaoContato() {
    if (contatoFeito) {
      return 'border-emerald-600 bg-emerald-600 text-white cursor-not-allowed';
    }
    if (oportunidade.status === 'Encerrada') {
      return 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed';
    }
    return 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer';
  }

  // vai para a pagina do cliente
  function irParaCliente() {
    navigate(`/clientes/${oportunidade.clienteId}`);
  }

  // encerra a oportunidade chamando o backend
  async function confirmarEncerramento() {
    setSalvandoEncerramento(true);
    setErroEncerramento('');

    try {
      await api(`/oportunidades/${oportunidade.id}/encerrar`, {
        method: 'POST',
      });

      setModalEncerrarAberto(false);

      if (onEncerrarOportunidade) {
        onEncerrarOportunidade(oportunidade.id);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErroEncerramento(err.message);
      } else {
        setErroEncerramento('Não foi possível encerrar a oportunidade.');
      }
    } finally {
      setSalvandoEncerramento(false);
    }
  }

  // formata a condição de pagamento e quitação da viagem
  function renderCondicoesPagamento() {
    if (!oportunidade.formaPagamento && !oportunidade.dataQuitacao) {
      return null;
    }

    let textoCondicao = oportunidade.formaPagamento || 'Pagamento';
    if (oportunidade.totalParcelas && oportunidade.totalParcelas > 1) {
      textoCondicao = `${oportunidade.totalParcelas}x no ${oportunidade.formaPagamento || 'Boleto'}`;
    } else if (oportunidade.totalParcelas === 1) {
      textoCondicao = `À vista no ${oportunidade.formaPagamento || 'PIX'}`;
    }

    const estaQuitado = oportunidade.statusPagamento === 'quitado' || Boolean(oportunidade.dataQuitacao);
    const textoQuitacao = oportunidade.dataQuitacao
      ? `Quitado em ${formatarDataBR(oportunidade.dataQuitacao)}`
      : estaQuitado
        ? 'Quitado'
        : 'Em aberto';

    return (
      <div className="flex items-center gap-1.5 mt-2 text-xs bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 w-fit">
        <CreditCard size={13} className="text-slate-500 shrink-0" />
        <span className="font-semibold text-slate-800">{textoCondicao}</span>
        <span className="text-slate-300">•</span>
        <span className={estaQuitado ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
          {textoQuitacao}
        </span>
      </div>
    );
  }

  const cores = getCoresPrioridade();

  return (
    <div
      className={`flex flex-col xl:flex-row xl:items-stretch justify-between gap-4 p-4 rounded-xl border border-slate-200 border-l-4 ${cores.borda} bg-white shadow-xs hover:shadow-md transition-all select-none w-full`}
    >
      {/* lado esquerdo: avatar e informacoes da oportunidade */}
      <div className="flex gap-3.5 flex-1 min-w-0">
        {/* avatar com iniciais do cliente */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${cores.avatarFundo} ${cores.avatarTexto}`}
        >
          {oportunidade.iniciais}
        </div>

        {/* informacoes centrais da oportunidade */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`flex items-center gap-1.5 text-xs font-bold uppercase ${cores.texto}`}>
              <span className={`w-2 h-2 rounded-full ${cores.ponto}`} />
              {oportunidade.prioridade}
            </span>

            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getCorStatus()}`}>
              {oportunidade.status}
            </span>

            <span className="text-xs text-slate-400">
              Criada em {formatarDataBR(oportunidade.dataCriacao)}
            </span>
          </div>

          <h4 className="font-bold text-sm text-slate-900 leading-tight">
            {oportunidade.nomeCliente}
          </h4>

          <div className="text-xs text-blue-600 font-semibold mt-0.5">
            {oportunidade.tipo}
          </div>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {oportunidade.descricao}
          </p>

          {/* Paises de interesse do cliente */}
          {oportunidade.paisesInteresse && oportunidade.paisesInteresse.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11.5px] text-sidebar-text">Interesse em:</span>
              {oportunidade.paisesInteresse.map((pais) => (
                <span key={pais} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#e8eefd] text-[#1d4ed8]">
                  {pais}
                </span>
              ))}
            </div>
          )}

          {renderCondicoesPagamento()}

          <div className="text-xs text-slate-400 mt-2">
            Último contato: {oportunidade.ultimoContato}
          </div>
        </div>
      </div>

      {/* lado direito ou inferior: contato sugerido e botoes */}
      <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between gap-3 shrink-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100">
        <div className="text-left xl:text-right text-xs text-slate-500">
          Contato sugerido:
          <b className="block text-xs text-slate-800 font-bold mt-0.5">
            {oportunidade.contatoSugerido}
          </b>
        </div>

        {/* botoes de acao */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <button
            type="button"
            onClick={irParaCliente}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Ver cliente
          </button>

          {oportunidade.status !== 'Encerrada' && (
            <button
              type="button"
              onClick={() => setModalEncerrarAberto(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Encerrar
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!contatoFeito && oportunidade.status !== 'Encerrada') {
                setModalContatoAberto(true);
              }
            }}
            disabled={contatoFeito || oportunidade.status === 'Encerrada'}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs ${getEstiloBotaoContato()}`}
          >
            {contatoFeito ? 'Contato feito!' : 'Registrar contato'}
          </button>
        </div>
      </div>

      {/* modal para registrar novo contato */}
      {modalContatoAberto && (
        <ModalRegistrarContato
          isOpen={modalContatoAberto}
          onClose={() => setModalContatoAberto(false)}
          onSucesso={() => {
            setContatoFeito(true);
            try {
              const historicoAtual = localStorage.getItem('@viagenda:contatos-feitos');
              const listaIds: string[] = historicoAtual ? JSON.parse(historicoAtual) : [];
              if (!listaIds.includes(String(oportunidade.id))) {
                listaIds.push(String(oportunidade.id));
                localStorage.setItem('@viagenda:contatos-feitos', JSON.stringify(listaIds));
              }
            } catch {
              // ignora erro no localstorage
            }
            if (onRegistrarContato) onRegistrarContato(oportunidade.id);
          }}
          clienteId={Number(oportunidade.clienteId)}
          clienteNome={oportunidade.nomeCliente}
          oportunidadeId={Number(oportunidade.id)}
        />
      )}

      {/* modal para confirmar encerramento */}
      {modalEncerrarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Encerrar oportunidade
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Deseja encerrar o ciclo de acompanhamento desta oportunidade para{' '}
              <b className="text-slate-800">{oportunidade.nomeCliente}</b>?
            </p>
            <p className="mt-1 text-xs text-slate-400">
              O status será alterado para encerrada e o registro ficará no histórico.
            </p>

            {erroEncerramento && (
              <p className="mt-3 text-xs text-rose-600 font-medium">
                {erroEncerramento}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalEncerrarAberto(false)}
                disabled={salvandoEncerramento}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEncerramento}
                disabled={salvandoEncerramento}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {salvandoEncerramento ? 'Encerrando...' : 'Sim, encerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardOportunidade;
