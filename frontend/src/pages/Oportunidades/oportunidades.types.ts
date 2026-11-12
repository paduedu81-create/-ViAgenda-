export interface Oportunidade {
  id: string | number;
  clienteId: number;
  iniciais: string;
  nomeCliente: string;
  tipo: string; // 'Pós-viagem', 'Acompanhamento', 'Nova oportunidade'
  descricao: string;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  status: 'Aberta' | 'Em andamento' | 'Concluída' | 'Encerrada';
  dataCriacao: string;
  ultimoContato: string;
  contatoSugerido: string;
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