// tipagem da resposta do endpoint GET /api/dashboard
export interface MetricasDashboard {
  clientes: number;
  oportunidades_ativas: number;
  contatos_mes: number;
  viagens_futuras: number;
}

export interface ProximoContatoApi {
  id_oportunidade: number;
  data_proximo_contato: string | null;
  tipo_origem: 'pos_viagem' | 'fim_pagamento' | 'manual' | null;
  descricao: string | null;
  status_oportunidade: string;
  id_cliente: number;
  nome_cliente: string;
  telefone: string | null;
  interesses: string | null;
}

export interface DashboardApiResponse {
  metricas: MetricasDashboard;
  proximos_contatos: ProximoContatoApi[];
}

// tipagem do item retornado pelo endpoint GET /api/oportunidades
export interface OportunidadeApi {
  id_oportunidade: number;
  id_cliente: number;
  id_viagem_referencia: number | null;
  data_geracao: string;
  status_oportunidade: 'ativa' | 'em_andamento' | 'encerrada';
  ciclo_recorrencia: number;
  data_encerramento: string | null;
  tipo_origem: 'pos_viagem' | 'fim_pagamento' | 'manual' | null;
  descricao: string | null;
  data_proximo_contato: string | null;
  nome_cliente: string;
  telefone: string | null;
  email: string | null;
  data_retorno: string | null;
  nome_destino: string | null;
}