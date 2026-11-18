import { useState } from "react";
import { CardRelatorio } from "./components/CardRelatorio";
import { Activity, Clock, Phone, Users, BarChart2 } from "lucide-react";
import { api } from "../../services/api";
import type { OportunidadeApi } from "../Oportunidades/oportunidades.types";

type TipoRelatorio = "priority" | "status" | "contacts" | "profile";

interface LinhaResultado {
  label: string;
  value: number;
  cor: string;
}

interface ResultadoRelatorio {
  id: TipoRelatorio;
  titulo: string;
  periodo: string;
  linhas: LinhaResultado[];
  total: number;
}

interface RelatoriosApiResponse {
  periodo: { de: string; ate: string };
  oportunidades_por_status: { label: string; value: number }[];
  contatos_por_canal: { label: string; value: number }[];
  clientes_por_situacao: { label: string; value: number }[];
}

export default function Relatorios() {
  // define datas padrao dos ultimos 30 dias
  const hoje = new Date();
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(hoje.getDate() - 30);

  const formatarIso = (d: Date) => d.toISOString().split("T")[0];

  // estados das datas do período
  const [dataDe, setDataDe] = useState(() => formatarIso(trintaDiasAtras));
  const [dataAte, setDataAte] = useState(() => formatarIso(hoje));
  const [intervaloAtivo, setIntervaloAtivo] = useState<"7" | "30" | "all" | null>("30");

  // estado que armazena o resultado do relatório gerado
  const [resultado, setResultado] = useState<ResultadoRelatorio | null>(null);
  const [carregando, setCarregando] = useState(false);

  // atualiza as datas conforme o atalho selecionado
  const handleSelecionarIntervalo = (tipo: "7" | "30" | "all") => {
    setIntervaloAtivo(tipo);
    if (tipo === "all") {
      setDataDe("");
      setDataAte("");
      return;
    }

    const agora = new Date();
    const inicio = new Date(agora);
    inicio.setDate(agora.getDate() - (tipo === "7" ? 7 : 30));

    setDataDe(formatarIso(inicio));
    setDataAte(formatarIso(agora));
  };

  // formata data para exibicao amigavel
  const formatarBR = (iso: string) => {
    if (!iso) return "";
    const partes = iso.split("-");
    if (partes.length !== 3) return iso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // gera os dados do relatório consultando os endpoints reais do backend
  const handleGerarRelatorio = async (id: TipoRelatorio) => {
    setCarregando(true);

    const deParam = dataDe ? encodeURIComponent(dataDe) : "1900-01-01";
    const ateParam = dataAte ? encodeURIComponent(dataAte) : "2999-12-31";

    const textoPeriodo = dataDe && dataAte
      ? `${formatarBR(dataDe)} até ${formatarBR(dataAte)}`
      : "Todo o período";

    try {
      let titulo = "";
      let linhas: LinhaResultado[] = [];

      if (id === "priority") {
        titulo = "Oportunidades por prioridade";
        const oportunidades = await api<OportunidadeApi[]>('/oportunidades');

        // filtra oportunidades pelo periodo de geracao
        const filtradas = (oportunidades || []).filter((o) => {
          if (!o.data_geracao) return true;
          const dataOp = o.data_geracao.slice(0, 10);
          if (dataDe && dataOp < dataDe) return false;
          if (dataAte && dataOp > dataAte) return false;
          return true;
        });

        const alta = filtradas.filter((o) => o.tipo_origem === "pos_viagem").length;
        const media = filtradas.filter((o) => o.tipo_origem === "fim_pagamento").length;
        const baixa = filtradas.length - alta - media;

        linhas = [
          { label: "Alta (Pós-viagem)", value: alta, cor: "bg-rose-500" },
          { label: "Média (Fim de pagamento)", value: media, cor: "bg-amber-500" },
          { label: "Baixa (Outros)", value: Math.max(0, baixa), cor: "bg-emerald-500" },
        ];
      } else {
        const dados = await api<RelatoriosApiResponse>(`/relatorios?de=${deParam}&ate=${ateParam}`);

        if (id === "status") {
          titulo = "Oportunidades por status";
          const mapeamentoStatus: Record<string, { label: string; cor: string }> = {
            ativa: { label: "Aberta", cor: "bg-brand-primary" },
            em_andamento: { label: "Em andamento", cor: "bg-amber-500" },
            encerrada: { label: "Encerrada", cor: "bg-slate-400" },
            bloqueada: { label: "Bloqueada", cor: "bg-rose-500" },
          };

          linhas = (dados.oportunidades_por_status || []).map((item) => ({
            label: mapeamentoStatus[item.label]?.label || item.label,
            value: item.value,
            cor: mapeamentoStatus[item.label]?.cor || "bg-slate-500",
          }));
        } else if (id === "contacts") {
          titulo = "Contatos registrados";
          const coresCanais: Record<string, string> = {
            WhatsApp: "bg-emerald-500",
            Telefone: "bg-brand-primary",
            "E-mail": "bg-amber-500",
            Presencial: "bg-purple-500",
          };

          linhas = (dados.contatos_por_canal || []).map((item) => ({
            label: item.label,
            value: item.value,
            cor: coresCanais[item.label] || "bg-slate-500",
          }));
        } else if (id === "profile") {
          titulo = "Clientes por situação cadastral";
          const mapeamentoSituacao: Record<string, { label: string; cor: string }> = {
            ja_atendido: { label: "Já atendido", cor: "bg-emerald-500" },
            orcamento_aberto: { label: "Orçamento aberto", cor: "bg-brand-primary" },
            outro: { label: "Outro", cor: "bg-amber-500" },
            insatisfeito: { label: "Insatisfeito", cor: "bg-rose-500" },
            nao_contatar: { label: "Não contatar", cor: "bg-slate-400" },
          };

          linhas = (dados.clientes_por_situacao || []).map((item) => ({
            label: mapeamentoSituacao[item.label]?.label || item.label,
            value: item.value,
            cor: mapeamentoSituacao[item.label]?.cor || "bg-slate-500",
          }));
        }
      }

      // soma a quantidade total
      const total = linhas.reduce((acumulado, linha) => acumulado + linha.value, 0);

      setResultado({
        id,
        titulo,
        periodo: textoPeriodo,
        linhas,
        total,
      });
    } catch (err) {
      console.error("erro ao gerar relatorio:", err);
    } finally {
      setCarregando(false);
    }
  };

  const relatorios: {
    id: TipoRelatorio;
    icone: React.ReactNode;
    titulo: string;
    descricao: string;
  }[] = [
    {
      id: "priority",
      icone: <Activity size={20} />,
      titulo: "Oportunidades por prioridade",
      descricao: "Distribuição das oportunidades criadas no período, por nível de prioridade."
    },
    {
      id: "status",
      icone: <Clock size={20} />,
      titulo: "Oportunidades por status",
      descricao: "Quantas oportunidades estão abertas, em andamento ou encerradas no período."
    },
    {
      id: "contacts",
      icone: <Phone size={20} />,
      titulo: "Contatos registrados",
      descricao: "Volume de contatos (ligação, WhatsApp, e-mail, presencial) realizados no período."
    },
    {
      id: "profile",
      icone: <Users size={20} />,
      titulo: "Clientes por situação",
      descricao: "Clientes cadastrados no período agrupados por situação de atendimento."
    }
  ];

  // cálculo do maior valor para determinar a proporção percentual da barra
  const valorMaximo = resultado ? Math.max(1, ...resultado.linhas.map((l) => l.value)) : 1;

  return (
    <div className="flex flex-col gap-6">
      {/* cabeçalho da página */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Relatórios</h2>
        <p className="text-xs text-slate-500 mt-1">
          Relatórios gerados em tempo real com dados da base. Escolha o período e clique no relatório desejado.
        </p>
      </div>

      {/* barra de seleção de período */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-end gap-3 sm:gap-4">
        {/* data inicial */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            De
          </label>
          <input
            type="date"
            value={dataDe}
            onChange={(e) => {
              setDataDe(e.target.value);
              setIntervaloAtivo(null);
            }}
            className="border rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* data final */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Até
          </label>
          <input
            type="date"
            value={dataAte}
            onChange={(e) => {
              setDataAte(e.target.value);
              setIntervaloAtivo(null);
            }}
            className="border rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* atalhos rápidos de intervalo */}
        <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto pt-2 sm:pt-0">
          <button
            type="button"
            onClick={() => handleSelecionarIntervalo("7")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              intervaloAtivo === "7"
                ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary hover:text-brand-primary"
            }`}
          >
            Últimos 7 dias
          </button>
          <button
            type="button"
            onClick={() => handleSelecionarIntervalo("30")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              intervaloAtivo === "30"
                ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary hover:text-brand-primary"
            }`}
          >
            Últimos 30 dias
          </button>
          <button
            type="button"
            onClick={() => handleSelecionarIntervalo("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              intervaloAtivo === "all"
                ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary hover:text-brand-primary"
            }`}
          >
            Tudo
          </button>
        </div>
      </div>

      {/* grid com os cards de relatórios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {relatorios.map((rel) => (
          <CardRelatorio
            key={rel.id}
            icone={rel.icone}
            titulo={rel.titulo}
            descricao={rel.descricao}
            onGerar={() => handleGerarRelatorio(rel.id)}
          />
        ))}
      </div>

      {/* painel de carregamento */}
      {carregando && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 flex flex-col items-center justify-center gap-2 shadow-xs">
          <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Calculando indicadores...</span>
        </div>
      )}

      {/* painel de resultado do relatório selecionado */}
      {!carregando && resultado && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden transition-all animate-in fade-in duration-200">
          {/* cabeçalho do resultado */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
                <BarChart2 size={16} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {resultado.titulo}
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
              {resultado.periodo}
            </span>
          </div>

          {/* corpo com as barras de resultado */}
          <div className="p-6">
            {resultado.total === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhum resultado encontrado para o período selecionado.
              </div>
            ) : (
              <div className="space-y-4">
                {resultado.linhas.map((linha) => {
                  const percentual = Math.round((linha.value / valorMaximo) * 100);
                  return (
                    <div
                      key={linha.label}
                      className="grid grid-cols-[130px_1fr_40px] sm:grid-cols-[160px_1fr_48px] items-center gap-3 sm:gap-4 text-xs"
                    >
                      {/* rótulo */}
                      <span className="font-bold text-slate-700 truncate">
                        {linha.label}
                      </span>

                      {/* trilho e preenchimento da barra */}
                      <div className="h-3 bg-slate-100 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${linha.cor} rounded-lg transition-all duration-500`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>

                      {/* valor numérico final */}
                      <span className="font-extrabold text-slate-900 text-right">
                        {linha.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
