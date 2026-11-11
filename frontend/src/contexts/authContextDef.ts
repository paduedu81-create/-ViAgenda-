import { createContext } from 'react';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'admin' | 'vendedor';
  cargo: string;
  iniciais: string;
}

export interface AuthContextType {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; mensagem?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

