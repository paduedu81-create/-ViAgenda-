export interface EventoHistorico {
  id: number;
  data: string;
  titulo: string;
  descricao: string;
  tipo: 'viagem' | 'contato' | 'pagamento';
}

export interface ViagemDetalhe {
  id: number;
  destino: string;
  tipoPacote: string;
  status: string;
  embarque: string;
  retorno: string;
  valorTotal: string;
  valorPago: string;
  percentualPago: number;
}

export interface ContatoDetalhe {
  id: number;
  canal: 'WhatsApp' | 'Telefone' | 'E-mail';
  data: string;
  mensagem: string;
  resultado: string;
  vendedor: string;
}

// historico completo para linha do tempo do cliente
export const historicoMock: EventoHistorico[] = [
  {
    id: 1,
    data: '25/07/2026',
    titulo: 'Retorno de Cancún',
    descricao: 'Cliente retornou da viagem para Cancún, México.',
    tipo: 'viagem',
  },
  {
    id: 2,
    data: '24/07/2026',
    titulo: 'Contato pós-embarque',
    descricao: 'Cliente confirmou chegada via WhatsApp.',
    tipo: 'contato',
  },
  {
    id: 3,
    data: '15/07/2026',
    titulo: 'Embarque para Cancún',
    descricao: 'Início da viagem para Cancún, México.',
    tipo: 'viagem',
  },
  {
    id: 4,
    data: '10/07/2026',
    titulo: 'Checklist pré-viagem',
    descricao: 'Lembrete de documentação enviado por telefone.',
    tipo: 'contato',
  },
  {
    id: 5,
    data: '05/05/2026',
    titulo: 'Quitação do pacote',
    descricao: 'Pacote Cancún quitado integralmente — R$ 18.500.',
    tipo: 'pagamento',
  },
];

// viagens realizadas e contratadas pelo cliente
export const viagensMock: ViagemDetalhe[] = [
  {
    id: 1,
    destino: 'Cancún, México',
    tipoPacote: 'Pacote Internacional',
    status: 'Concluída',
    embarque: '15/07/2026',
    retorno: '25/07/2026',
    valorTotal: 'R$ 18.500,00',
    valorPago: 'R$ 18.500,00',
    percentualPago: 100,
  },
  {
    id: 2,
    destino: 'Gramado, RS',
    tipoPacote: 'Pacote Nacional',
    status: 'Concluída',
    embarque: '10/06/2025',
    retorno: '15/06/2025',
    valorTotal: 'R$ 4.200,00',
    valorPago: 'R$ 4.200,00',
    percentualPago: 100,
  },
];

// historico de contatos comerciais com o cliente
export const contatosDetalheMock: ContatoDetalhe[] = [
  {
    id: 1,
    canal: 'WhatsApp',
    data: '24/07/2026',
    mensagem: 'Cliente confirmou chegada. Viagem excelente.',
    resultado: 'Interessado',
    vendedor: 'Antônio',
  },
  {
    id: 2,
    canal: 'Telefone',
    data: '10/07/2026',
    mensagem: 'Lembrete de documentação e checklist pré-viagem.',
    resultado: 'Interessado',
    vendedor: 'Antônio',
  },
];

