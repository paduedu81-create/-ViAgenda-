import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import CardOportunidade from '../Dashboard/components/CardOportunidade';
import CardPrioridade from './components/CardPrioridade';
import { oportunidadesMock } from '../../data/oportunidadesMock';

type FiltroStatus = 'todas' | 'aberta' | 'andamento' | 'encerrada';

export default function Oportunidades() {
  // estado para o texto de busca
  const [busca, setBusca] = useState('');

  // estado para o filtro de status selecionado
  const [statusAtivo, setStatusAtivo] = useState<FiltroStatus>('todas');

  // cálculo dos totais por prioridade
  const totalAlta = oportunidadesMock.filter((op) => op.prioridade === 'ALTA').length;
  const totalMedia = oportunidadesMock.filter((op) => op.prioridade === 'MEDIA').length;
  const totalBaixa = oportunidadesMock.filter((op) => op.prioridade === 'BAIXA').length;

  // lista de cards do topo usando classes de prioridade do tema
  const cardsPrioridade = [
    {
      label: 'Prioridade alta',
      valor: totalAlta,
      corDot: 'bg-priority-alta',
    },
    {
      label: 'Prioridade média',
      valor: totalMedia,
      corDot: 'bg-priority-media',
    },
    {
      label: 'Prioridade baixa',
      valor: totalBaixa,
      corDot: 'bg-priority-baixa',
    },
  ];

  // lista filtrada por busca e status, ordenada por prioridade
  const oportunidadesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const ordemPrioridade = { ALTA: 0, MEDIA: 1, BAIXA: 2 };

    return oportunidadesMock
      .filter((op) => {
        // filtro de status
        const bateStatus =
          statusAtivo === 'todas' ||
          (statusAtivo === 'aberta' && op.status === 'Aberta') ||
          (statusAtivo === 'andamento' && op.status === 'Em andamento') ||
          (statusAtivo === 'encerrada' && op.status === 'Encerrada');

        // filtro de texto de busca
        const bateBusca =
          !termo ||
          op.nomeCliente.toLowerCase().includes(termo) ||
          op.tipo.toLowerCase().includes(termo) ||
          op.descricao.toLowerCase().includes(termo);

        return bateStatus && bateBusca;
      })
      .sort((a, b) => ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade]);
  }, [busca, statusAtivo]);

  // opções de filtros de status
  const opcoesFiltro: { id: FiltroStatus; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'aberta', label: 'Aberta' },
    { id: 'andamento', label: 'Em andamento' },
    { id: 'encerrada', label: 'Encerrada' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* faixa de resumo de prioridades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {cardsPrioridade.map((card) => (
          <CardPrioridade
            key={card.label}
            label={card.label}
            valor={card.valor}
            corDot={card.corDot}
          />
        ))}
      </div>

      {/* barra de busca e filtros de status */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* campo de busca */}
        <div className="relative flex-1 min-w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou tipo de oportunidade..."
            className="w-full bg-white border rounded-xl pl-10 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
          />
        </div>

        {/* botões de filtro por status */}
        <div className="flex items-center gap-2 flex-wrap">
          {opcoesFiltro.map((filtro) => {
            const isAtivo = statusAtivo === filtro.id;
            return (
              <button
                key={filtro.id}
                onClick={() => setStatusAtivo(filtro.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none border ${isAtivo
                  ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-brand-primary hover:text-brand-primary'
                  }`}
              >
                {filtro.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* listagem de oportunidades */}
      <div className="flex flex-col gap-3">
        {oportunidadesFiltradas.length > 0 ? (
          oportunidadesFiltradas.map((op) => (
            <CardOportunidade
              key={op.id}
              oportunidade={op}
              onRegistrarContato={(id) => console.log('registrar contato', id)}
            />
          ))
        ) : (
          /* caso esteja vazio */
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center">
            <Search className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-900">
              Nenhuma oportunidade encontrada
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Tente alterar os termos da busca ou os filtros de status selecionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}