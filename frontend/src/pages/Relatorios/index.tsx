import { useState } from "react";
import { CardRelatorio } from "./components/CardRelatorio";
import { Activity, Clock, Phone, Users, BarChart2 } from "lucide-react";
import { oportunidadesMock } from "../../data/oportunidadesMock";
import { clientesMock } from "../../data/clientesMock";
import { contatosLogMock } from "../../data/contatosLogMock";

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

export default function Relatorios() {
  // estados das datas do período
  const [dataDe, setDataDe] = useState("2026-08-01");
  const [dataAte, setDataAte] = useState("2026-08-30");
  const [intervaloAtivo, setIntervaloAtivo] = useState<"7" | "30" | "all" | null>("30");

  // estado que armazena o resultado do relatório gerado
  const [resultado, setResultado] = useState<ResultadoRelatorio | null>(null);

  // atualiza as datas conforme o atalho selecionado
  const handleSelecionarIntervalo = (tipo: "7" | "30" | "all") => {
    setIntervaloAtivo(tipo);
    if (tipo === "all") {
      setDataDe("");
      setDataAte("");
      return;
    }

    // data de referência do sistema para manter compatibilidade com os mocks
    const baseFim = new Date(2026, 7, 30);
    const baseInicio = new Date(baseFim);
    baseInicio.setDate(baseInicio.getDate() - (tipo === "7" ? 7 : 30));

    const formataData = (d: Date) => d.toISOString().split("T")[0];
    setDataDe(formataData(baseInicio));
    setDataAte(formataData(baseFim));
  };

  // formata data
  const formatarBR = (iso: string) => {
    if (!iso) return "";
    const partes = iso.split("-");
    if (partes.length !== 3) return iso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // verifica se uma data está dentro do range selecionado
  const dataEstaNoPeriodo = (dataString: string) => {
    if (!dataString) return false;
    if (!dataDe && !dataAte) return true;

    let dataObj: Date;
    if (dataString.includes("/")) {
      const [dia, mes, ano] = dataString.split("/").map(Number);
      dataObj = new Date(ano, mes - 1, dia);
    } else {
      dataObj = new Date(dataString);
    }

    if (dataDe) {
      const inicio = new Date(dataDe);
      if (dataObj < inicio) return false;
    }
    if (dataAte) {
      const fim = new Date(dataAte);
      fim.setHours(23, 59, 59, 999);
      if (dataObj > fim) return false;
    }
    return true;
  };

  // gera os dados do relatório com base no card clicado
  const handleGerarRelatorio = (id: TipoRelatorio) => {
    let titulo = "";
    let linhas: LinhaResultado[] = [];

    // texto do período exibido no cabeçalho
    const textoPeriodo = dataDe && dataAte
      ? `${formatarBR(dataDe)} até ${formatarBR(dataAte)}`
      : "Todo o período";

    if (id === "priority") {
      titulo = "Oportunidades por prioridade";
      const filtradas = oportunidadesMock.filter((o) => dataEstaNoPeriodo(o.dataCriacao));
      linhas = [
        {
          label: "Alta",
          value: filtradas.filter((o) => o.prioridade === "ALTA").length,
          cor: "bg-rose-500",
        },
        {
          label: "Média",
          value: filtradas.filter((o) => o.prioridade === "MEDIA").length,
          cor: "bg-amber-500",
        },
        {
          label: "Baixa",
          value: filtradas.filter((o) => o.prioridade === "BAIXA").length,
          cor: "bg-emerald-500",
        },
      ];
    } else if (id === "status") {
      titulo = "Oportunidades por status";
      const filtradas = oportunidadesMock.filter((o) => dataEstaNoPeriodo(o.dataCriacao));
      linhas = [
        {
          label: "Aberta",
          value: filtradas.filter((o) => o.status === "Aberta").length,
          cor: "bg-brand-primary",
        },
        {
          label: "Em andamento",
          value: filtradas.filter((o) => o.status === "Em andamento").length,
          cor: "bg-amber-500",
        },
        {
          label: "Encerrada",
          value: filtradas.filter((o) => o.status === "Encerrada").length,
          cor: "bg-slate-400",
        },
      ];
    } else if (id === "contacts") {
      titulo = "Contatos registrados";
      const filtrados = contatosLogMock.filter((l) => dataEstaNoPeriodo(l.date));
      linhas = [
        {
          label: "Ligação",
          value: filtrados.filter((l) => l.type === "Ligação").length,
          cor: "bg-brand-primary",
        },
        {
          label: "WhatsApp",
          value: filtrados.filter((l) => l.type === "WhatsApp").length,
          cor: "bg-emerald-500",
        },
        {
          label: "E-mail",
          value: filtrados.filter((l) => l.type === "E-mail").length,
          cor: "bg-amber-500",
        },
      ];
    } else if (id === "profile") {
      titulo = "Clientes por perfil";
      const filtrados = clientesMock.filter((c) => dataEstaNoPeriodo(c.registeredAt));
      linhas = [
        {
          label: "Família",
          value: filtrados.filter((c) => c.profile === "Família").length,
          cor: "bg-brand-primary",
        },
        {
          label: "Casal",
          value: filtrados.filter((c) => c.profile === "Casal").length,
          cor: "bg-emerald-500",
        },
        {
          label: "Solo",
          value: filtrados.filter((c) => c.profile === "Solo").length,
          cor: "bg-amber-500",
        },
        {
          label: "Negócios",
          value: filtrados.filter((c) => c.profile === "Negócios").length,
          cor: "bg-rose-500",
        },
      ];
    }

    // soma a quantidade total
    let total = 0;
    linhas.forEach((linha) => {
      total += linha.value;
    });

    setResultado({
      id,
      titulo,
      periodo: textoPeriodo,
      linhas,
      total,
    });
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
        descricao: "Volume de contatos (ligação, WhatsApp, e-mail) realizados no período."
      },
      {
        id: "profile",
        icone: <Users size={20} />,
        titulo: "Clientes por perfil",
        descricao: "Novos clientes cadastrados no período, agrupados por perfil de viagem."
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
          Relatórios pré-prontos. Escolha um período e gere o resultado.
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
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${intervaloAtivo === "7"
              ? "bg-brand-primary text-white border-brand-primary shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary hover:text-brand-primary"
              }`}
          >
            Últimos 7 dias
          </button>
          <button
            type="button"
            onClick={() => handleSelecionarIntervalo("30")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${intervaloAtivo === "30"
              ? "bg-brand-primary text-white border-brand-primary shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary hover:text-brand-primary"
              }`}
          >
            Últimos 30 dias
          </button>
          <button
            type="button"
            onClick={() => handleSelecionarIntervalo("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${intervaloAtivo === "all"
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
        {relatorios.map(rel => (
          <CardRelatorio
            key={rel.id}
            icone={rel.icone}
            titulo={rel.titulo}
            descricao={rel.descricao}
            onGerar={() => handleGerarRelatorio(rel.id)}
          />
        ))}
      </div>

      {/* painel de resultado do relatório selecionado */}
      {resultado && (
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
                      className="grid grid-cols-[110px_1fr_40px] sm:grid-cols-[130px_1fr_48px] items-center gap-3 sm:gap-4 text-xs"
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