import { useState } from 'react';
import { Plane, CreditCard, FlaskConical } from 'lucide-react';
import { api } from '../../../services/api';

type Cenario = 'pos-viagem' | 'fim-pagamento';

interface SimulacaoResposta {
  cenario: string;
  cliente: { id_cliente: number; nome_cliente: string };
  oportunidades: { id_oportunidade: number; tipo_origem: string | null }[];
}

interface SimuladorOportunidadesProps {
  // chamado depois de uma simulação concluída, para a lista ser recarregada
  onConcluido: () => void;
}

// dois botões que criam um cliente de teste com datas fictícias e rodam o cruzador real
export default function SimuladorOportunidades({ onConcluido }: SimuladorOportunidadesProps) {
  const [executando, setExecutando] = useState<Cenario | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const simular = async (cenario: Cenario) => {
    setExecutando(cenario);
    setMensagem('');
    setErro('');

    try {
      const res = await api<SimulacaoResposta>(`/simulacao/${cenario}`, { method: 'POST' });
      const total = res.oportunidades.length;
      setMensagem(
        total > 0
          ? `Simulação de ${res.cenario} criada para "${res.cliente.nome_cliente}": ${total} oportunidade gerada pelo cruzador.`
          : `Simulação de ${res.cenario} criada para "${res.cliente.nome_cliente}", mas o cruzador não gerou oportunidade.`
      );
      onConcluido();
    } catch (e: any) {
      setErro(e?.message || 'Falha ao executar a simulação');
    } finally {
      setExecutando(null);
    }
  };

  const classeBotao =
    'inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <FlaskConical className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-900">Simular cenários</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Cria um cliente de teste com datas fictícias e executa o cruzador para mostrar cada tipo de oportunidade.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => simular('pos-viagem')}
            disabled={executando !== null}
            className={classeBotao}
          >
            <Plane size={14} />
            <span>{executando === 'pos-viagem' ? 'Simulando...' : 'Simular pós-viagem'}</span>
          </button>
          <button
            type="button"
            onClick={() => simular('fim-pagamento')}
            disabled={executando !== null}
            className={classeBotao}
          >
            <CreditCard size={14} />
            <span>{executando === 'fim-pagamento' ? 'Simulando...' : 'Simular fim de pagamento'}</span>
          </button>
        </div>
      </div>

      {mensagem && <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{mensagem}</p>}
      {erro && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}
    </div>
  );
}
