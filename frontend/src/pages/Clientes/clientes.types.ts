
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