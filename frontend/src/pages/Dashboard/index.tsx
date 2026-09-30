import { CardOportunidade } from "./components/CardOportunidade";
import CardResumoDia from "./components/CardResumoDia";
import CardProximosContatos, { type ProximoContato } from "./components/CardProximosContatos";
import MetricCard from "./components/MetricCard";
import { ArrowRight, Calendar, Target, Users, Activity } from 'lucide-react'
import { colors } from "../../theme/colors";
import { oportunidadesMock } from "../../data/oportunidadesMock";

export default function Dashboard() {

  const resumoDiaMock = {
    data: '30 de agosto de 2026 · domingo',
    contatosConcluidos: 2,
    totalAlta: 6,
    totalMedia: 8,
    totalBaixa: 2,
    totalOportunidades: 16,
  };




  const proximosContatosMock: ProximoContato[] = [
    {
      id: 1,
      nomeCliente: 'Beatriz Souza',
      tipo: 'Acompanhamento',
      dia: '31',
      mes: 'AGO',
      horario: '10:00',
    },
    {
      id: 2,
      nomeCliente: 'Pedro Santos',
      tipo: 'Pós-viagem',
      dia: '1',
      mes: 'SET',
      horario: '14:00',
    },
    {
      id: 3,
      nomeCliente: 'Lucas Martins',
      tipo: 'Nova oportunidade',
      dia: '2',
      mes: 'SET',
      horario: '16:00',
    },
  ];

  return (
    <>
      <div className="flex gap-4">
        <MetricCard
          icon={Users}
          value={67}
          label="Clientes ativos cadastrados"
          color={colors.brand.primary}
        />
        <MetricCard
          icon={Target}
          value={67}
          label="Oportunidades abertas"
          color={colors.priority.media}
        />
        <MetricCard
          icon={Calendar}
          value={67}
          label="Contatos para hoje"
          color={colors.priority.baixa}
        />
        <MetricCard
          icon={Activity}
          value={67}
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
              style={{ color: colors.brand.primary }}
              className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
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

        <div className="w-140 shrink-0 space-y-6">
          <CardResumoDia {...resumoDiaMock} />
          <CardProximosContatos contatos={proximosContatosMock} />
        </div>
      </div>

    </>
  )

}