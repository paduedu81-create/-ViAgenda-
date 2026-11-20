import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Compass, Send, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { api } from '../../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login, estaAutenticado } = useAuth();

  // estados dos campos do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);

  // estados de feedback de envio e erro
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // estados do modal de recuperacao de senha
  const [modalRecuperarAberto, setModalRecuperarAberto] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [carregandoRecuperacao, setCarregandoRecuperacao] = useState(false);
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState<string | null>(null);
  const [erroRecuperacao, setErroRecuperacao] = useState<string | null>(null);

  // se já estiver autenticado, redireciona para o dashboard
  if (estaAutenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  // submit do formulário de login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!email.trim() || !senha.trim()) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    setCarregando(true);
    const resultado = await login(email, senha);
    setCarregando(false);

    if (resultado.sucesso) {
      navigate('/dashboard', { replace: true });
    } else {
      setErro(resultado.mensagem || 'Credenciais inválidas.');
    }
  };

  // solicitacao de envio do link de recuperacao de senha
  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroRecuperacao(null);
    setMensagemRecuperacao(null);

    if (!emailRecuperacao.trim()) {
      setErroRecuperacao('Informe o e-mail cadastrado.');
      return;
    }

    setCarregandoRecuperacao(true);
    try {
      const res = await api<{ mensagem: string }>('/auth/esqueci-senha', {
        method: 'POST',
        body: JSON.stringify({ email: emailRecuperacao.trim() }),
      });
      setMensagemRecuperacao(res.mensagem || 'Instruções enviadas com sucesso.');
    } catch (err: any) {
      setErroRecuperacao(err.message || 'Erro ao solicitar redefinição de senha.');
    } finally {
      setCarregandoRecuperacao(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans selection:bg-blue-100 selection:text-brand-primary">

      {/* painel lateral */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-[#0b1526] text-white flex-col justify-between p-10 xl:p-12 relative overflow-hidden">

        {/* topo do branding com logotipo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1D5BD8] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-900/40">
              <Send size={18} className="rotate-[-20deg]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">ViAgenda</span>
              <span className="block text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                AGT Viagens
              </span>
            </div>
          </div>
        </div>

        {/* proposta de valor central */}
        <div className="relative z-10 space-y-6 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles size={13} className="text-blue-400" />
            <span>Inteligência Comercial Pós-Venda</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Transforme retornos de viagem em <span className="text-blue-400">novas oportunidades.</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            O ViAgenda encontra, explica, lembra e registra; você decide e conduz o atendimento comercial com a máxima assertividade.
          </p>

          {/* destaques em bullets elegantes */}
          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={13} />
              </div>
              <span>Gatilhos pós-retorno e alerta de parcelas quitadas</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={13} />
              </div>
              <span>Histórico contextualizado de interações por cliente</span>
            </div>
          </div>
        </div>

        {/* rodapé institucional */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>UniSatc</span>
          <span>© {new Date().getFullYear()} AGT Viagens</span>
        </div>
      </div>

      {/* painel do formulário de acesso */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-7">
          {/* cabeçalho do login mobile / branding mobile */}
          <div className="space-y-2">
            <div className="lg:hidden flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-600/30">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">ViAgenda</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Acesse a plataforma
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Digite suas credenciais comerciais para gerenciar suas oportunidades.
            </p>
          </div>

          {/* alerta de erro caso login falhe */}
          {erro && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-700 font-medium leading-relaxed">
                {erro}
              </div>
            </div>
          )}

          {/* formulário principal */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* campo de e-mail */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 tracking-wide">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendedor@agtviagens.com.br"
                  required
                  className="w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-xs"
                />
              </div>
            </div>

            {/* campo de senha com alternador de visibilidade */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  Senha de acesso
                </label>

              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border rounded-xl pl-10 pr-11 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalRecuperarAberto(true);
                  setMensagemRecuperacao(null);
                  setErroRecuperacao(null);
                  setEmailRecuperacao(email);
                }}
                className="text-xs text-brand-primary hover:underline font-semibold cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* checkbox lembrar de mim */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="lembrar"
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
              <label htmlFor="lembrar" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
                Lembrar deste dispositivo
              </label>
            </div>

            {/* botão de submissão */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {carregando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no ViAgenda</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* informação de configuração do acesso real */}
          <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11.5px] font-bold text-slate-700 uppercase tracking-wider">
                Acesso ao sistema
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use o e-mail e a senha cadastrados no backend. O administrador inicial deve ser configurado pelo responsável técnico.
            </p>
          </div>
        </div>
      </div>

      {/* modal de recuperacao de senha */}
      {modalRecuperarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={() => setModalRecuperarAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recuperar Senha</h3>
                <p className="text-xs text-slate-500">Enviaremos um link seguro para o seu e-mail.</p>
              </div>
            </div>

            {mensagemRecuperacao ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{mensagemRecuperacao}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Verifique a sua caixa de entrada e spam. O link expirará em 15 minutos.
                </p>
                <button
                  type="button"
                  onClick={() => setModalRecuperarAberto(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecuperarSenha} className="space-y-4">
                {erroRecuperacao && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{erroRecuperacao}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    E-mail cadastrado
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={emailRecuperacao}
                      onChange={(e) => setEmailRecuperacao(e.target.value)}
                      placeholder="seu.email@viagens.com.br"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalRecuperarAberto(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={carregandoRecuperacao}
                    className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs"
                  >
                    {carregandoRecuperacao ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <span>Enviar link de recuperação</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
