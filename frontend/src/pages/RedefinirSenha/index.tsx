import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Send, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  // estados dos campos e feedback
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // submissao do formulario de redefinicao de senha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!token) {
      setErro('Token de recuperação ausente ou inválido.');
      return;
    }

    if (novaSenha.length < 8) {
      setErro('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas digitadas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      await api<{ mensagem: string }>('/auth/redefinir-senha', {
        method: 'POST',
        body: JSON.stringify({ token, novaSenha }),
      });
      setSucesso(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err: any) {
      setErro(err.message || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 selection:bg-blue-100 selection:text-brand-primary">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 space-y-6">

        {/* logo do viagenda */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1D5BD8] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-900/40">
            <Send size={18} className="rotate-[-20deg]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">ViAgenda</span>
            <span className="block text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              AGT Viagens
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Criar nova senha</h1>
          <p className="text-xs text-slate-500 mt-1">
            Escolha uma senha forte com no mínimo 8 caracteres para proteger a sua conta.
          </p>
        </div>

        {/* caso o token nao esteja presente na url */}
        {!token ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Link de recuperação inválido. O link pode estar incompleto ou você acessou a página diretamente.
              </span>
            </div>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>Voltar para o Login</span>
            </Link>
          </div>
        ) : sucesso ? (
          /* tela de confirmacao de sucesso */
          <div className="space-y-4 py-2 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Senha alterada com sucesso!</p>
                <p className="mt-0.5 text-emerald-700">Você será redirecionado para a tela de login em alguns segundos...</p>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              <span>Ir para o Login agora</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* formulario de troca de senha */
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{erro}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nova senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Confirme a nova senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  minLength={8}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {carregando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Salvando nova senha...</span>
                </>
              ) : (
                <>
                  <span>Salvar nova senha</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Voltar ao login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
