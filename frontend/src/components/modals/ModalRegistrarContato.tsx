import { useState } from 'react';
import { X, Calendar, Target, Check } from 'lucide-react';
import { api } from '../../services/api';

interface ModalRegistrarContatoProps {
    isOpen: boolean;
    onClose: () => void;
    onSucesso?: () => void;
    clienteId: number;
    clienteNome?: string;
    oportunidadeId?: number | null;
}

export default function ModalRegistrarContato({
    isOpen,
    onClose,
    onSucesso,
    clienteId,
    clienteNome,
    oportunidadeId,
}: ModalRegistrarContatoProps) {
    // estados do formulário base do clienteDetalhes
    const [canal, setCanal] = useState<'WhatsApp' | 'Telefone' | 'E-mail' | 'Presencial'>('WhatsApp');
    const [mensagem, setMensagem] = useState('');
    const [resultado, setResultado] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    // novos estados para os pontos 2 e 3 da reunião com antônio
    const [reagendarDias, setReagendarDias] = useState<number | null>(null);
    const [encerrarOportunidade, setEncerrarOportunidade] = useState(false);
    const [qualificadoPaxPro, setQualificadoPaxPro] = useState(false);

    if (!isOpen) return null;

    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault();
        setCarregando(true);
        setErro('');

        try {
            // monta o resultado comercial
            let resultadoFinal = resultado.trim();
            if (qualificadoPaxPro) {
                resultadoFinal = resultadoFinal ? `${resultadoFinal} • Qualificado PaxPro` : 'Qualificado para o PaxPro (Orçamento Firme)';
            } else if (reagendarDias) {
                resultadoFinal = resultadoFinal ? `${resultadoFinal} • Reagendado +${reagendarDias}d` : `Reagendado para +${reagendarDias} dias`;
            }

            const body = {
                id_cliente: clienteId,
                id_oportunidade: oportunidadeId || null,
                canal,
                mensagem,
                resultado: resultadoFinal || null,
                reagendar_dias: reagendarDias || undefined,
                encerrar_oportunidade: encerrarOportunidade || qualificadoPaxPro,
            };

            // se tiver id_oportunidade usa a rota com id, senão usa /contatos geral
            const endpoint = oportunidadeId ? `/contatos/${oportunidadeId}/registrar` : '/contatos';
            await api(endpoint, {
                method: 'POST',
                body: JSON.stringify(body),
            });

            if (onSucesso) onSucesso();
            onClose();
        } catch (err: any) {
            setErro(err?.message || 'Erro ao registrar contato');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 select-none"
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Registrar contato</h3>
                        {clienteNome && <p className="text-xs text-slate-500 mt-0.5">Cliente: <b className="text-slate-800">{clienteNome}</b></p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSalvar} className="mt-4 flex flex-col gap-4">
                    {/* 1. canal utilizado */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Canal utilizado
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['WhatsApp', 'Telefone', 'E-mail', 'Presencial'] as const).map((opcao) => (
                                <button
                                    key={opcao}
                                    type="button"
                                    onClick={() => setCanal(opcao)}
                                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${canal === opcao
                                            ? 'border-brand-primary bg-blue-50 text-brand-primary'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    {opcao}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. mensagem / resumo do contato */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Mensagem / Resumo do contato
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                            placeholder="Ex: Cliente elogiou a viagem e planeja férias para o final do ano."
                            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-700 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none"
                        />
                    </div>

                    {/* resultado opcional */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Resultado (opcional)
                        </label>
                        <input
                            type="text"
                            value={resultado}
                            onChange={(e) => setResultado(e.target.value)}
                            placeholder="Ex: Interessado, Aguardando cotação, Sem Interesse"
                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                    </div>

                    {/* 3. reagendamento de gatilho comercial (ponto 2 da reuniao) */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-500" />
                            Reagendar retorno (Gatilho comercial)
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            {[30, 60, 90].map((dias) => (
                                <button
                                    key={dias}
                                    type="button"
                                    onClick={() => setReagendarDias(reagendarDias === dias ? null : dias)}
                                    className={`py-2 px-2 text-xs rounded-lg font-semibold border transition-all cursor-pointer text-center ${reagendarDias === dias
                                            ? 'border-brand-primary bg-blue-50 text-brand-primary shadow-xs'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    +{dias} dias
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. qualificacao para o paxpro (ponto 3 da reuniao) */}
                    <div className="flex flex-col gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                setQualificadoPaxPro(!qualificadoPaxPro);
                                if (!qualificadoPaxPro) setEncerrarOportunidade(true);
                            }}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${qualificadoPaxPro
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            <Target size={15} className={qualificadoPaxPro ? 'text-emerald-600' : 'text-slate-400'} />
                            <div className="flex-1 min-w-0">
                                <span className="block text-xs font-bold leading-tight">Qualificado para PaxPro</span>
                                <span className="block text-[10.5px] opacity-80 leading-tight">Cliente pediu orçamento firme</span>
                            </div>
                            {qualificadoPaxPro && <Check size={14} className="text-emerald-600 shrink-0" />}
                        </button>

                        {/* checkbox para encerrar oportunidade */}
                        {oportunidadeId && (
                            <label className="flex items-center gap-2 px-1 pt-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={encerrarOportunidade}
                                    onChange={(e) => setEncerrarOportunidade(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-brand-primary cursor-pointer"
                                />
                                <span className="text-xs text-slate-600">Encerrar oportunidade atual após registrar</span>
                            </label>
                        )}
                    </div>

                    {erro && <p className="text-xs text-rose-600 font-medium">{erro}</p>}

                    {/* rodape de acoes */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={carregando}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={carregando}
                            className="rounded-xl bg-brand-primary px-5 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50 cursor-pointer shadow-sm transition-all"
                        >
                            {carregando ? 'Salvando...' : 'Salvar contato'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}