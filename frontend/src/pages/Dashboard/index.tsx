import { CardOportunidade, type Oportunidade } from "./components/CardOportunidade";
import CardResumoDia from "./components/CardResumoDia";
import MetricCard from "./components/MetricCard";
import { ArrowRight, Users } from 'lucide-react'

export default function Dashboard() {

  const resumoDiaMock = {
    data: '30 de agosto de 2026 · domingo',
    contatosConcluidos: 2,
    totalAlta: 6,
    totalMedia: 8,
    totalBaixa: 2,
    totalOportunidades: 16,
  };


  const oportunidadesMock: Oportunidade[] = [
    {
      id: 1,
      iniciais: 'JD',
      nomeCliente: 'João da Silva',
      tipo: 'Pós-viagem',
      prioridade: 'ALTA',
      status: 'Aberta',
      dataCriacao: '19/08/2026',
      descricao: 'Cliente retornou recentemente de uma viagem e possui oportunidade de acompanhamento.',
      ultimoContato: '25 dias atrás',
      contatoSugerido: 'Hoje',
    },
    {
      id: 2,
      iniciais: 'BN',
      nomeCliente: 'Beatriz Nunes',
      tipo: 'Pós-viagem',
      prioridade: 'MEDIA',
      status: 'Aberta',
      dataCriacao: '21/08/2026',
      descricao: 'Retorno de Roma há mais de uma semana sem contato de acompanhamento.',
      ultimoContato: '10 dias atrás',
      contatoSugerido: 'Hoje',
    },
    {
      id: 3,
      iniciais: 'FL',
      nomeCliente: 'Fernanda Lima',
      tipo: 'Pós-viagem',
      prioridade: 'BAIXA',
      status: 'Aberta',
      dataCriacao: '04/08/2026',
      descricao: 'Cliente voltou de Paris — ótimo momento para oferecer o próximo destino.',
      ultimoContato: '27 dias atrás',
      contatoSugerido: 'Hoje',
    },
  ];


  return (
    <>
      <div className="flex gap-4">
        <MetricCard
          icon={Users}
          value={67}
          label="Clientes ativos cadastrados"
        />
        <MetricCard
          icon={Users}
          value={67}
          label="Oportunidades abertas"
          color="#D97706"
        />
        <MetricCard
          icon={Users}
          value={67}
          label="Contatos para hoje"
          color="#16A34A"
        />
        <MetricCard
          icon={Users}
          value={67}
          label="Oportunidades alta prioridade"
          color="#E11D48"
        />
      </div>

      <div className="flex gap-6 items-start mt-8">

        <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold font-plus text-slate-900 text-base md:text-lg">
              Oportunidades de hoje
            </h3>
            <button className="text-xs font-semibold text-[#1D5BD8] hover:underline flex items-center gap-1 cursor-pointer">
              Ver todas
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Lista de Oportunidades */}
          <div className="mt-5 space-y-4">
            {oportunidadesMock.map((op) => (
              <CardOportunidade key={op.id} oportunidade={op} />
            ))}
          </div>
        </div>

        <div className="w-[320px] shrink-0 space-y-6">
          <CardResumoDia {...resumoDiaMock} />
        </div>
      </div>

    </>
  )

}