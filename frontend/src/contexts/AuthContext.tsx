import { useState } from 'react';
import { usuariosMock, type Usuario } from '../data/usuariosMock';
import { AuthContext } from './authContextDef';

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

    // simulando um delay de internet
    await new Promise((resolve) => setTimeout(resolve, 800));

    const emailTratado = email.trim().toLowerCase();
    const usuarioEncontrado = usuariosMock.find(
      (user) => user.email.toLowerCase() === emailTratado && user.senha === senha
    );

    setCarregando(false);

    if (usuarioEncontrado) {
      setUsuario(usuarioEncontrado);
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuarioEncontrado));
      return { sucesso: true };
    }

    return {
      sucesso: false,
      mensagem: 'E-mail ou senha incorretos. Verifique suas credenciais.',
    };
  };

  // encerra a sessão do usuário
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(CHAVE_STORAGE);
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
