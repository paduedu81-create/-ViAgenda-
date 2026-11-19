
export type PerfilCliente = 'Família' | 'Casal' | 'Solo' | 'Negócios';
export type PrioridadeCliente = 'alta' | 'media' | 'baixa' | 'none';

export interface ClienteApi {
  id_cliente: number;
  nome_cliente: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  perfil?: PerfilCliente | string | null;
  tipo_situacao: 'ja_atendido' | 'orcamento_aberto' | 'nao_contatar' | 'insatisfeito' | 'outro';
  data_cadastro: string;
  ativo: boolean;
  total_viagens: number;
  ultima_viagem: string | null;
  proxima_viagem: string | null;
  ultimo_contato: string | null;
}

export interface PaginacaoApi {
  pagina: number;
  limite: number;
  total: number;
  paginas: number;
}

export interface ClientesApiResponse {
  dados: ClienteApi[];
  paginacao: PaginacaoApi;
}

export interface Cliente {
  id: number;
  name: string;
  phone: string;
  email: string;
  profile: PerfilCliente;
  totalTrips: number;
  lastTrip: string | null;
  nextTrip: string | null;
  lastContact: string;
  priority: PrioridadeCliente;
  opportunity: string | null;
  registeredAt: string;
}

// tipo da resposta completa que a api devolve para os detalhes do cliente
export interface ClienteDetalhesApi {
  id_cliente: number;
  nome_cliente: string;
  telefone?: string | null;
  email?: string | null;
  cpf_cnpj?: string | null;
  tipo_situacao?: string;
  data_cadastro?: string | null;
  perfil?: PerfilCliente | string | null;
  viagens?: ViagemItem[];
  contatos?: ContatoItem[];
  interesses?: InteresseItem[];
}

// itens de viagens realizados pelo cliente
export interface ViagemItem {
  id_viagem: number;
  id_destino?: number | null;
  destino?: string | null;
  data_ida: string;
  data_retorno: string;
  valor_total: number | string;
  status_viagem: string;
}
// registros de contatos anteriores
export interface ContatoItem {
  id_contato: number;
  id_cliente: number;
  id_oportunidade?: number | null;
  id_vendedor?: number | null;
  canal: 'WhatsApp' | 'Telefone' | 'E-mail' | 'Presencial';
  mensagem: string;
  resultado?: string | null;
  data_contato: string;
  vendedor?: string;
}
// interesses em destinos registrados
export interface InteresseItem {
  id_interesse: number;
  id_destino: number;
  nome_destino: string;
  descricao_interesse?: string | null;
}