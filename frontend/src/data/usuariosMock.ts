export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  cargo: string;
  iniciais: string;
  avatar?: string;
}

// lista de usuários mockados para autenticação no sistema
export const usuariosMock: Usuario[] = [
  {
    id: 1,
    nome: 'Antônio Silva',
    email: 'antonio@agtviagens.com.br',
    senha: '123',
    cargo: 'Vendedor Comercial',
    iniciais: 'AS',
  },
  {
    id: 2,
    nome: 'Ana Paula Mendes',
    email: 'gerencia@agtviagens.com.br',
    senha: 'admin',
    cargo: 'Supervisora Comercial',
    iniciais: 'AP',
  },
];

