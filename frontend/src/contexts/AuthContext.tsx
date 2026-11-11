import { useEffect, useState } from 'react';
import { AuthContext, type Usuario } from './authContextDef';
import { api } from '../services/api';

const CHAVE_STORAGE = '@viagenda:auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(() => Boolean(localStorage.getItem('@viagenda:token')));

  useEffect(() => {
    const token = localStorage.getItem('@viagenda:token');
    if (!token) return;

    api<Omit<Usuario, 'cargo' | 'iniciais'>>('/auth/me')
      .then((data) => {
        const sessao = mapearUsuario(data);
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(sessao));
        setUsuario(sessao);
      })
      .catch(() => {
        localStorage.removeItem('@viagenda:token');
        localStorage.removeItem(CHAVE_STORAGE);
      })
      .finally(() => setCarregando(false));
  }, []);

  const login = async (email: string, senha: string): Promise<{ sucesso: boolean; mensagem?: string }> => {
    setCarregando(true);

    try {
      const data = await api<{ token: string; usuario: Omit<Usuario, 'cargo' | 'iniciais'> }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), senha })
      });

      const sessao = mapearUsuario(data.usuario);
      localStorage.setItem('@viagenda:token', data.token);
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(sessao));
      setUsuario(sessao);

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

function mapearUsuario(usuario: Omit<Usuario, 'cargo' | 'iniciais'>): Usuario {
  const nomes = usuario.nome.trim().split(/\s+/);
  const iniciais = nomes.length > 1
    ? `${nomes[0][0]}${nomes[nomes.length - 1][0]}`
    : nomes[0].slice(0, 2);

  return {
    ...usuario,
    iniciais: iniciais.toLocaleUpperCase('pt-BR'),
    cargo: usuario.perfil === 'admin' ? 'Administrador' : 'Vendedor Comercial',
  };
}
