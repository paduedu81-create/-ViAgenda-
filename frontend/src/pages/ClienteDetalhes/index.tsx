import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserX, Phone, Mail, User, Plus, Plane, CreditCard, Star } from 'lucide-react';
import { extrairIniciais, calcularDiasAtras, formatarDataBR } from '../../utils/formatters';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type {
  Cliente,
  ClienteDetalhesApi,
  PerfilCliente,
  PrioridadeCliente,
  ViagemItem,
  ContatoItem,
  InteresseItem,
} from '../Clientes/clientes.types';
import type { OportunidadeApi } from '../Oportunidades/oportunidades.types';
import ModalRegistrarContato from '../../components/modals/ModalRegistrarContato';

type AbaDetalhes = 'visao360' | 'historico' | 'viagens' | 'contatos';

export interface EventoHistorico {
  id: string | number;
  data: string;
  titulo: string;
  descricao: string;
  tipo: 'viagem' | 'contato' | 'pagamento';
}

// componente reutilizavel de linha do tempo
function Timeline({ itens }: { itens: EventoHistorico[] }) {
  if (itens.length === 0) {
    return (
      <p className="text-xs text-slate-400 py-6 text-center">
        Nenhum evento registrado no histórico deste cliente.
      </p>
    );
  }

  return (
    <div className="relative flex flex-col gap-6">
      {/* linha vertical conectora dos eventos */}
      <div className="absolute top-4 bottom-4 left-4 -translate-x-1/2 w-0.5 bg-slate-100" />
      {itens.map((item) => {
        let icone = <Plane size={15} />;
        let estiloIcone = 'bg-blue-100 text-blue-600';

        if (item.tipo === 'contato') {
          icone = <Phone size={15} />;
          estiloIcone = 'bg-purple-100 text-purple-600';
        } else if (item.tipo === 'pagamento') {
          icone = <CreditCard size={15} />;
          estiloIcone = 'bg-emerald-100 text-emerald-600';
        }

        return (
          <div key={item.id} className="relative flex items-start gap-4 z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${estiloIcone}`}
            >
              {icone}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-400 font-medium">{item.data}</span>
              <h4 className="text-sm font-bold text-slate-900">{item.titulo}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.descricao}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}



// formata valor em moeda brasileira
function formatarMoeda(valor?: number | string | null): string {
  if (valor === undefined || valor === null || valor === '') return 'R$ 0,00';
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ClienteDetalhes() {
  const { id } = useParams();

  // estado do cliente carregado da api
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [viagens, setViagens] = useState<ViagemItem[]>([]);
  const [contatos, setContatos] = useState<ContatoItem[]>([]);
  const [interesses, setInteresses] = useState<InteresseItem[]>([]);
  const [oportunidadeDescricao, setOportunidadeDescricao] = useState<string | null>(null);
  const [oportunidadeAtiva, setOportunidadeAtiva] = useState<OportunidadeApi | null>(null);
  const [modalEncerrarOp, setModalEncerrarOp] = useState(false);
  const [encerrandoOp, setEncerrandoOp] = useState(false);
  const [erroEncerrarOp, setErroEncerrarOp] = useState('');

  // estado de carregamento
  const [carregando, setCarregando] = useState(true);

  // estado da aba atualmente selecionada
  const [abaAtiva, setAbaAtiva] = useState<AbaDetalhes>('visao360');

  // estado para modal de registrar contato
  const [modalContato, setModalContato] = useState(false);

  // busca os dados reais do cliente e suas oportunidades na api
  const carregarCliente = useCallback(async () => {
    if (!id) return;
    setCarregando(true);

    try {
      const [dataCli, ops] = await Promise.all([
        api<ClienteDetalhesApi>(`/clientes/${id}`),
        api<OportunidadeApi[]>('/oportunidades').catch(() => []),
      ]);

      const listaViagens: ViagemItem[] = Array.isArray(dataCli.viagens) ? dataCli.viagens : [];
      const listaContatos: ContatoItem[] = Array.isArray(dataCli.contatos) ? dataCli.contatos : [];
      const listaInteresses: InteresseItem[] = Array.isArray(dataCli.interesses) ? dataCli.interesses : [];

      setViagens(listaViagens);
      setContatos(listaContatos);
      setInteresses(listaInteresses);

      // localiza se ha oportunidade ativa vinculada ao cliente
      const opAtiva = ops.find(
        (o) => o.id_cliente === Number(id) && o.status_oportunidade !== 'encerrada'
      );
      if (opAtiva) {
        setOportunidadeAtiva(opAtiva);
        setOportunidadeDescricao(opAtiva.descricao || 'Oportunidade comercial em aberto para acompanhamento.');
      } else {
        setOportunidadeAtiva(null);
        setOportunidadeDescricao(null);
      }

      // mapeia informacoes consolidadas do cliente
      const prioridade: PrioridadeCliente =
        dataCli.tipo_situacao === 'orcamento_aberto'
          ? 'alta'
          : dataCli.tipo_situacao === 'ja_atendido'
            ? 'media'
            : 'none';

      const ultimaViagemNome = listaViagens[0]?.destino || null;
      const ultimoContatoData = listaContatos[0]?.data_contato
        ? String(listaContatos[0].data_contato).slice(0, 10)
        : 'Sem contato';

      const cli: Cliente = {
        id: dataCli.id_cliente,
        name: dataCli.nome_cliente,
        phone: dataCli.telefone || '—',
        email: dataCli.email || '—',
        profile: (dataCli.perfil as PerfilCliente) || 'Família',
        totalTrips: listaViagens.length,
        lastTrip: ultimaViagemNome,
        nextTrip: null,
        lastContact: ultimoContatoData,
        priority: prioridade,
        opportunity: opAtiva ? opAtiva.descricao || 'Oportunidade identificada' : null,
        registeredAt: dataCli.data_cadastro ? String(dataCli.data_cadastro).slice(0, 10) : '',
      };

      setCliente(cli);
    } catch (err) {
      console.error('erro ao carregar detalhes do cliente:', err);
      setCliente(null);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregarCliente();
  }, [carregarCliente]);

  // encerra a oportunidade ativa do cliente chamando o backend
  async function handleEncerrarOportunidade() {
    if (!oportunidadeAtiva) return;

    setEncerrandoOp(true);
    setErroEncerrarOp('');

    try {
      await api(`/oportunidades/${oportunidadeAtiva.id_oportunidade}/encerrar`, {
        method: 'POST',
      });

      // fecha o modal e recarrega as informacoes da tela
      setModalEncerrarOp(false);
      await carregarCliente();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErroEncerrarOp(err.message);
      } else {
        setErroEncerrarOp('Falha ao encerrar oportunidade');
      }
    } finally {
      setEncerrandoOp(false);
    }
  }

  // monta lista combinada de eventos para a linha do tempo
  const eventosLinhaDoTempo: EventoHistorico[] = [
    ...viagens.map((v) => ({
      id: `viagem-${v.id_viagem}`,
      data: formatarDataBR(v.data_ida),
      titulo: `Viagem: ${v.destino || 'Destino a definir'}`,
      descricao: `Status: ${v.status_viagem} • Ida: ${formatarDataBR(v.data_ida)} • Retorno: ${formatarDataBR(
        v.data_retorno
      )} • Valor: ${formatarMoeda(v.valor_total)}`,
      tipo: 'viagem' as const,
      timestamp: new Date(v.data_ida).getTime(),
    })),
    ...contatos.map((c) => ({
      id: `contato-${c.id_contato}`,
      data: formatarDataBR(c.data_contato),
      titulo: `Contato via ${c.canal}`,
      descricao: `${c.mensagem}${c.resultado ? ` (Resultado: ${c.resultado})` : ''}`,
      tipo: 'contato' as const,
      timestamp: new Date(c.data_contato).getTime(),
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((evento) => ({
      id: evento.id,
      data: evento.data,
      titulo: evento.titulo,
      descricao: evento.descricao,
      tipo: evento.tipo,
    }));

  const abas: { id: AbaDetalhes; label: string }[] = [
    { id: 'visao360', label: 'Visão 360°' },
    { id: 'historico', label: 'Histórico' },
    { id: 'viagens', label: 'Viagens' },
    { id: 'contatos', label: 'Contatos' },
  ];

  // tela de carregamento enquanto busca na api
  if (carregando) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Carregando detalhes do cliente...</p>
      </div>
    );
  }

  // se o id não existir na base de dados
  if (!cliente) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <UserX size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800">Cliente não encontrado</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          O cliente de código #{id} não existe ou foi removido da sua carteira.
        </p>
        <Link
          to="/clientes"
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar para Clientes
        </Link>
      </div>
    );
  }

  // mapeamento visual de cores e rótulos unificados por prioridade
  const prioridadeConfig = {
    alta: {
      label: 'Alta prioridade',
      badge: 'bg-red-50 text-red-600',
      avatar: 'bg-red-50 text-red-500',
      dot: 'bg-red-500',
      oportunidadeBox: 'bg-red-50/50 border-red-200 text-red-700',
      estrela: 'text-red-500',
    },
    media: {
      label: 'Média prioridade',
      badge: 'bg-amber-50 text-amber-700',
      avatar: 'bg-amber-50 text-amber-500',
      dot: 'bg-amber-500',
      oportunidadeBox: 'bg-amber-50/50 border-amber-200 text-amber-700',
      estrela: 'text-amber-500',
    },
    baixa: {
      label: 'Baixa prioridade',
      badge: 'bg-emerald-50 text-emerald-700',
      avatar: 'bg-emerald-50 text-emerald-500',
      dot: 'bg-emerald-500',
      oportunidadeBox: 'bg-emerald-50/50 border-emerald-200 text-emerald-700',
      estrela: 'text-emerald-500',
    },
    none: {
      label: 'Sem prioridade',
      badge: 'bg-slate-50 text-slate-600',
      avatar: 'bg-purple-50 text-purple-500',
      dot: 'bg-slate-400',
      oportunidadeBox: 'bg-slate-50 border-slate-200 text-slate-700',
      estrela: 'text-slate-400',
    },
  }[cliente.priority];

  return (
    <div className="flex flex-col gap-6">
      {/* link de voltar */}
      <div>
        <Link
          to="/clientes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </Link>
      </div>

      {/* card de cabeçalho do cliente */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* avatar com iniciais e cor baseada na prioridade */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${prioridadeConfig.avatar}`}
            >
              {extrairIniciais(cliente.name)}
            </div>

            {/* info e contato */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{cliente.name}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${prioridadeConfig.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${prioridadeConfig.dot}`} />
                  {prioridadeConfig.label}
                </span>
              </div>

              {/* dados de contato e responsável */}
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Phone size={13} className="text-slate-400" />
                  {cliente.phone}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" />
                  {cliente.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User size={13} className="text-slate-400" />
                  {cliente.profile}
                </span>
                {interesses.length > 0 && (
                  <span className="text-slate-500">
                    Interesses: <strong className="text-slate-700 font-semibold">{interesses.map(i => i.nome_destino).join(', ')}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setModalContato(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus size={14} />
            Registrar contato
          </button>
        </div>

        <hr className="my-6 border-t border-slate-100" />

        {/* 5 métricas em destaque */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900">{cliente.totalTrips}</span>
            <span className="text-xs text-slate-400 mt-0.5">Viagens realizadas</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900">{cliente.lastTrip || '—'}</span>
            <span className="text-xs text-slate-400 mt-0.5">Última viagem</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900">{cliente.nextTrip || '—'}</span>
            <span className="text-xs text-slate-400 mt-0.5">Próxima viagem</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900">{calcularDiasAtras(cliente.lastContact)}</span>
            <span className="text-xs text-slate-400 mt-0.5">Último contato</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900">{cliente.opportunity || '—'}</span>
            <span className="text-xs text-slate-400 mt-0.5">Oportunidade</span>
          </div>
        </div>

        {/* destaque de oportunidade identificada */}
        {oportunidadeDescricao && (
          <div className={`mt-5 p-4 rounded-xl border ${prioridadeConfig.oportunidadeBox}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Star size={16} className={prioridadeConfig.estrela} />
                <span>Oportunidade identificada</span>
              </div>
              {oportunidadeAtiva && (
                <button
                  type="button"
                  onClick={() => setModalEncerrarOp(true)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 bg-white/90 hover:bg-white text-red-600 transition-all cursor-pointer shadow-2xs"
                >
                  Encerrar oportunidade
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {oportunidadeDescricao}
            </p>
          </div>
        )}
      </div>

      {/* seletor de abas */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-2xs">
        {abas.map((aba) => {
          const isAtiva = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${isAtiva
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              {aba.label}
            </button>
          );
        })}
      </div>

      {/* conteudo dinamico da aba ativa */}
      {abaAtiva === 'visao360' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* coluna da esquerda: linha do tempo */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
            <h3 className="font-bold text-slate-900 text-base">Linha do tempo</h3>
            <Timeline itens={eventosLinhaDoTempo} />
          </div>

          {/* coluna da direita: contatos recentes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4 h-fit">
            <h3 className="font-bold text-slate-900 text-base">Últimos contatos</h3>

            <div className="flex flex-col gap-3">
              {contatos.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Nenhum contato registrado ainda.</p>
              ) : (
                contatos.slice(0, 5).map((contato) => (
                  <div
                    key={contato.id_contato}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{contato.canal}</span>
                      <span className="text-xs text-slate-400">{formatarDataBR(contato.data_contato)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{contato.mensagem}</p>
                    {contato.resultado && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-brand-primary w-fit">
                        {contato.resultado}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'historico' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
          <h3 className="font-bold text-slate-900 text-base">Histórico completo</h3>
          <Timeline itens={eventosLinhaDoTempo} />
        </div>
      )}

      {abaAtiva === 'viagens' && (
        <div className="flex flex-col gap-4">
          {viagens.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Nenhuma viagem cadastrada para este cliente.
            </div>
          ) : (
            viagens.map((viagem) => (
              <div
                key={viagem.id_viagem}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {viagem.destino || 'Destino a definir'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Viagem #{viagem.id_viagem}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 capitalize">
                    {viagem.status_viagem}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Embarque</span>
                    <span className="text-sm font-bold text-slate-800">{formatarDataBR(viagem.data_ida)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Retorno</span>
                    <span className="text-sm font-bold text-slate-800">{formatarDataBR(viagem.data_retorno)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Valor total</span>
                    <span className="text-sm font-bold text-slate-800">{formatarMoeda(viagem.valor_total)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {abaAtiva === 'contatos' && (
        <div className="flex flex-col gap-4">
          {contatos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Nenhum contato registrado para este cliente.
            </div>
          ) : (
            contatos.map((contato) => (
              <div
                key={contato.id_contato}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-brand-primary">
                      {contato.canal}
                    </span>
                    <span className="text-xs text-slate-400">{formatarDataBR(contato.data_contato)}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">{contato.mensagem}</p>

                {contato.resultado && (
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Resultado:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                      {contato.resultado}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* modal de registrar novo contato */}
      {modalContato && (
        <ModalRegistrarContato
          isOpen={modalContato}
          onClose={() => setModalContato(false)}
          onSucesso={carregarCliente}
          clienteId={Number(id)}
          clienteNome={cliente?.name}
          oportunidadeId={oportunidadeAtiva?.id_oportunidade}
        />
      )}

      {/* modal de confirmar encerramento da oportunidade do cliente */}
      {modalEncerrarOp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalEncerrarOp(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-150"
          >
            <h3 className="text-base font-bold text-slate-900">Encerrar oportunidade</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Deseja encerrar o acompanhamento desta oportunidade para{' '}
              <b className="text-slate-900">{cliente?.name}</b>?
            </p>
            <p className="mt-1 text-xs text-slate-400">
              O status será atualizado para encerrada e a oportunidade deixará de exigir atenção comercial imediata.
            </p>

            {erroEncerrarOp && (
              <p role="alert" className="mt-3 text-xs text-red-600">
                {erroEncerrarOp}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalEncerrarOp(false)}
                disabled={encerrandoOp}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEncerrarOportunidade}
                disabled={encerrandoOp}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {encerrandoOp ? 'Encerrando...' : 'Confirmar encerramento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
