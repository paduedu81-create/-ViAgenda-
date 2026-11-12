import { CardOportunidade } from "./components/CardOportunidade";
import { useNavigate } from 'react-router-dom';
import CardResumoDia from "./components/CardResumoDia";
import CardProximosContatos, { type ProximoContato } from "./components/CardProximosContatos";
import MetricCard from "./components/MetricCard";
import { ArrowRight, Calendar, Target, Users, Activity } from 'lucide-react'
import { colors } from "../../theme/colors";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { DashboardApiResponse } from "./dashboard.types";
import type { Oportunidade, OportunidadeApi } from "../Oportunidades/oportunidades.types";

export default function Dashboard() {
  const navigate = useNavigate();

  // estado para as métricas dos 4 cards de topo
  const [metricas, setMetricas] = useState({
    clientes: 0,
    oportunidades_ativas: 0,
    contatos_mes: 0,
    viagens_futuras: 0,
  });

  // estado para a lista de próximos contatos (card lateral)
  const [proximosContatos, setProximosContatos] = useState<ProximoContato[]>([]);

  // estado para as oportunidades reais do dia (substitui oportunidadesMock)
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);

  const [carregando, setCarregando] = useState<boolean>(false)

  useEffect(() => {
    setCarregando(true);

    Promise.all([
      api<DashboardApiResponse>('/dashboard'),
      api<OportunidadeApi[]>('/oportunidades')
    ])
      .then(([dashData, opData]) => {

        // atualiza os números das métricas
        if (dashData?.metricas) {
          setMetricas(dashData.metricas);
        }

        // mapeia os próximos contatos
        const contatosFormatados: ProximoContato[] = (dashData?.proximos_contatos || []).map((c) => {
          const dataObj = c.data_proximo_contato ? new Date(c.data_proximo_contato) : new Date();
          const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
          return {
            id: c.id_oportunidade,
            nomeCliente: c.nome_cliente,
            tipo: c.tipo_origem === 'pos_viagem' ? 'Pós-viagem' : c.tipo_origem === 'fim_pagamento' ? 'Fim de pagamento' : 'Acompanhamento',
            dia: dataObj.getUTCDate(),
            mes: meses[dataObj.getUTCMonth()],
            horario: '10:00',
          };
        });
        setProximosContatos(contatosFormatados);

        // 3. Mapeia as oportunidades reais da lista
        const opFormatadas: Oportunidade[] = (opData || []).map((o) => ({
          id: o.id_oportunidade,
          clienteId: o.id_cliente,
          iniciais: (o.nome_cliente || 'CL').slice(0, 2).toUpperCase(),
          nomeCliente: o.nome_cliente,
          tipo: o.tipo_origem === 'pos_viagem' ? 'Pós-viagem' : o.tipo_origem === 'fim_pagamento' ? 'Fim de pagamento' : 'Acompanhamento',
          descricao: o.descricao || '',
          prioridade: o.tipo_origem === 'pos_viagem' ? 'ALTA' : 'MEDIA',
          status: o.status_oportunidade === 'ativa' ? 'Aberta' : 'Em andamento',
          dataCriacao: o.data_geracao ? o.data_geracao.slice(0, 10) : '',
          ultimoContato: 'Sem contato',
          contatoSugerido: o.tipo_origem === 'pos_viagem' ? 'WhatsApp pós-viagem' : 'Ligação comercial',
        }));
        setOportunidades(opFormatadas);
      })
      .catch((err) => console.error('erro ao carregar dashboard:', err))
      .finally(() => setCarregando(false));
  }, []);

  // exibe estado de carregamento enquanto busca dados da api
  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Carregando indicadores do dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4">
        <MetricCard
          icon={Users}
          value={metricas.clientes}
          label="Clientes ativos cadastrados"
          color={colors.brand.primary}
        />
        <MetricCard
          icon={Target}
          value={metricas.oportunidades_ativas}
          label="Oportunidades abertas"
          color={colors.priority.media}
        />
        <MetricCard
          icon={Calendar}
          value={metricas.contatos_mes}
          label="Contatos para hoje"
          color={colors.priority.baixa}
        />
        <MetricCard
          icon={Activity}
          value={metricas.viagens_futuras}
          label="Oportunidades alta prioridade"
          color={colors.priority.alta}
        />
      </div>

      <div className="flex gap-6 items-start mt-8">

        <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3
              style={{ color: colors.text.primary }}
              className="font-bold font-plus text-base md:text-lg"
            >
              Oportunidades de hoje
            </h3>
            <button
              onClick={() => navigate('/oportunidades')}
              style={{ color: colors.brand.primary }}
              className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver todas
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Lista de Oportunidades */}
          <div className="mt-5 space-y-4">
            {oportunidades.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Nenhuma oportunidade pendente para hoje.</p>
            ) : (
              oportunidades.map((op) => (
                <CardOportunidade key={op.id} oportunidade={op} />
              ))
            )}
          </div>
        </div>

        <div className="w-140 shrink-0 space-y-6">
          <CardResumoDia
            data="Hoje"
            contatosConcluidos={metricas.contatos_mes}
            totalAlta={oportunidades.filter(o => o.prioridade === 'ALTA').length}
            totalMedia={oportunidades.filter(o => o.prioridade === 'MEDIA').length}
            totalBaixa={oportunidades.filter(o => o.prioridade === 'BAIXA').length}
            totalOportunidades={oportunidades.length}
          />
          <CardProximosContatos contatos={proximosContatos} />
        </div>
      </div>

    </>
  )

}
