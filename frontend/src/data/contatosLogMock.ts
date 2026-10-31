export interface ContatoLog {
  clientId: number;
  date: string;
  type: 'Ligação' | 'WhatsApp' | 'E-mail';
}

// histórico mockado de contatos para cálculo de relatórios
export const contatosLogMock: ContatoLog[] = [
  { clientId: 1, date: '2026-08-30', type: 'Ligação' },
  { clientId: 2, date: '2026-08-30', type: 'WhatsApp' },
  { clientId: 3, date: '2026-08-22', type: 'Ligação' },
  { clientId: 5, date: '2026-08-15', type: 'E-mail' },
  { clientId: 6, date: '2026-07-31', type: 'WhatsApp' },
  { clientId: 7, date: '2026-08-20', type: 'Ligação' },
  { clientId: 8, date: '2026-08-10', type: 'E-mail' },
  { clientId: 9, date: '2026-08-24', type: 'WhatsApp' },
  { clientId: 11, date: '2026-08-03', type: 'Ligação' },
  { clientId: 12, date: '2026-08-12', type: 'WhatsApp' },
  { clientId: 13, date: '2026-08-26', type: 'E-mail' },
  { clientId: 15, date: '2026-08-06', type: 'Ligação' },
  { clientId: 16, date: '2026-08-19', type: 'WhatsApp' },
  { clientId: 17, date: '2026-08-14', type: 'Ligação' },
  { clientId: 18, date: '2026-08-21', type: 'E-mail' },
  { clientId: 19, date: '2026-08-01', type: 'WhatsApp' },
  { clientId: 21, date: '2026-08-25', type: 'Ligação' },
  { clientId: 24, date: '2026-08-23', type: 'WhatsApp' },
];

