import { createContext } from 'react';
import type { Usuario } from '../data/usuariosMock';

export interface AuthContextType {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; mensagem?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

