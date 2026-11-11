import { useParams, Link } from 'react-router-dom';
import { type Cliente } from '../../data/clientesMock';
import { oportunidadesMock } from '../../data/oportunidadesMock';
import { ArrowLeft, UserX, Phone, Mail, User, Plus, Plane, CreditCard, Star } from 'lucide-react';
import { extrairIniciais, calcularDiasAtras } from '../../utils/formatters';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  historicoMock,
  viagensMock,
  contatosDetalheMock,
  type EventoHistorico,
} from '../../data/clienteDetalhesMock';

type AbaDetalhes = 'visao360' | 'historico' | 'viagens' | 'contatos';

// componente reutilizavel de linha do tempo
function Timeline({ itens }: { itens: EventoHistorico[] }) {
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

export default function ClienteDetalhes() {
  const { id } = useParams();

  // estado do cliente carregado da api
  const [cliente, setCliente] = useState<Cliente | null>(null);
  // estado de carregamento
  const [carregando, setCarregando] = useState(true);

  // busca os detalhes da oportunidade vinculada ao cliente
  const oportunidade = oportunidadesMock.find((o) => o.clienteId === cliente?.id);

  // estado da aba atualmente selecionada
  const [abaAtiva, setAbaAtiva] = useState<AbaDetalhes>('visao360');

  // carrega os dados reais do cliente pelo id
  useEffect(() => {
    if (!id) return;
    setCarregando(true);

    api<any>(`/clientes/${id}`)
      .then((data) => {
        // mapeia os dados do cliente retornado pelo backend
        const cli: Cliente = {
          id: data.id_cliente,
          name: data.nome_cliente,
          phone: data.telefone || '—',
          email: data.email || '—',
          profile: 'Família',
          totalTrips: Array.isArray(data.viagens) ? data.viagens.length : 0,
          lastTrip: data.viagens?.[0]?.destino || null,
          nextTrip: null,
          lastContact: data.contatos?.[0]?.data_contato ? String(data.contatos[0].data_contato).slice(0, 10) : 'Sem contato',
          priority: data.tipo_situacao === 'orcamento_aberto' ? 'alta' : data.tipo_situacao === 'ja_atendido' ? 'media' : 'none',
          opportunity: data.tipo_situacao === 'orcamento_aberto' ? 'Orçamento em aberto' : null,
          registeredAt: data.data_cadastro ? String(data.data_cadastro).slice(0, 10) : '',
        };
        setCliente(cli);
      })
      .catch((err) => {
        console.error('erro ao carregar detalhes do cliente:', err);
        setCliente(null);
      })
      .finally(() => setCarregando(false));
  }, [id]);

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
                <span>
                  Resp: <strong className="text-slate-700 font-semibold">Antônio</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => console.log('registrar contato', cliente.id)}
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

        {/* destaque de oportunidade identificada com estrela e descricao completa */}
        <div className={`mt-5 p-4 rounded-xl border ${prioridadeConfig.oportunidadeBox}`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <Star size={16} className={prioridadeConfig.estrela} />
            <span>Oportunidade identificada</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {oportunidade?.descricao ||
              'Cliente retornou recentemente de uma viagem e possui oportunidade de acompanhamento.'}
          </p>
        </div>
      </div>

      {/* seletor de abas */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-2xs">
        {abas.map((aba) => {
          const isAtiva = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                isAtiva
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
            <Timeline itens={historicoMock} />
          </div>

          {/* coluna da direita: ultimo contato */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4 h-fit">
            <h3 className="font-bold text-slate-900 text-base">Último contato</h3>

            <div className="flex flex-col gap-3">
              {contatosDetalheMock.map((contato) => (
                <div
                  key={contato.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{contato.canal}</span>
                    <span className="text-xs text-slate-400">{contato.data}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{contato.mensagem}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-brand-primary w-fit">
                    {contato.resultado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'historico' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
          <h3 className="font-bold text-slate-900 text-base">Histórico completo</h3>
          <Timeline itens={historicoMock} />
        </div>
      )}

      {abaAtiva === 'viagens' && (
        <div className="flex flex-col gap-4">
          {viagensMock.map((viagem) => (
            <div
              key={viagem.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viagem.destino}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{viagem.tipoPacote}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                  {viagem.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Embarque</span>
                  <span className="text-sm font-bold text-slate-800">{viagem.embarque}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Retorno</span>
                  <span className="text-sm font-bold text-slate-800">{viagem.retorno}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Valor total</span>
                  <span className="text-sm font-bold text-slate-800">{viagem.valorTotal}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Valor pago</span>
                  <span className="text-sm font-bold text-emerald-600">{viagem.valorPago}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Pagamento</span>
                  <span className="font-bold text-emerald-600">{viagem.percentualPago}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${viagem.percentualPago}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {abaAtiva === 'contatos' && (
        <div className="flex flex-col gap-4">
          {contatosDetalheMock.map((contato) => (
            <div
              key={contato.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-brand-primary">
                    {contato.canal}
                  </span>
                  <span className="text-xs text-slate-400">{contato.data}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Vendedor: {contato.vendedor}</span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{contato.mensagem}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <span className="text-slate-500">Resultado:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                  {contato.resultado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
