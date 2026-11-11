import { useState } from 'react';
import { type Usuario } from '../data/usuariosMock';
import { AuthContext } from './authContextDef';
import { api } from '../services/api';

const CHAVE_STORAGE = '@viagenda:auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // inicializa o estado de forma síncrona a partir do storage
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const [carregando, setCarregando] = useState<boolean>(false);

  // realiza o login verificando as credenciais mockadas
  const login = async (email: string, senha: string): Promise<{ sucesso: boolean; mensagem?: string }> => {
    setCarregando(true);

    try {
      const data = await api<{ token: string; usuario: Usuario }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      })

      localStorage.setItem('@viagenda:token', data.token);
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(data.usuario));
      setUsuario(data.usuario)

      return { sucesso: true };
    } catch (error: any) {
      return {
        sucesso: false,
        mensagem: error?.message || 'Falha ao autenticar'
      };
    } finally {
      setCarregando(false);
    }
  };

  // encerra a sessão do usuário
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(CHAVE_STORAGE);
    localStorage.removeItem('@viagenda:token')
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado: !!usuario,
        carregando,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
