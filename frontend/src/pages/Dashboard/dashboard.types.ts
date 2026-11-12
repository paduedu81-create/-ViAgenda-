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
