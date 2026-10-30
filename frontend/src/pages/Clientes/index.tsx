import { useState } from 'react';
import { Search, Plus, User, Phone, Mail, MapPin, Calendar, Clock, AlertCircle, X, Check } from 'lucide-react';
import { clientesMock, type Cliente, type PerfilCliente } from '../../data/clientesMock';
import { extrairIniciais, calcularDiasAtras } from '../../utils/formatters';

type FiltroPrioridade = 'todas' | 'alta' | 'media' | 'baixa';

export default function Clientes() {
  // estado da lista de clientes
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);

  // estado para o texto de busca
  const [busca, setBusca] = useState('');

  // estado para o filtro de prioridade
  const [prioridadeAtiva, setPrioridadeAtiva] = useState<FiltroPrioridade>('todas');

  // estado para o cliente selecionado no modal de detalhes
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);

  // estado para o modal de novo cliente
  const [modalNovoAberto, setModalNovoAberto] = useState(false);

  // campos do formulário de novo cliente
  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoPerfil, setNovoPerfil] = useState<PerfilCliente>('Família');
  const [novaProximaViagem, setNovaProximaViagem] = useState('');

  // lista filtrada por busca e prioridade
  const termoBusca = busca.trim().toLowerCase();
  const clientesFiltrados = clientes.filter((cli) => {
    // filtro por prioridade
    const batePrioridade =
      prioridadeAtiva === 'todas' || cli.priority === prioridadeAtiva;

    // filtro por texto
    const bateBusca =
      !termoBusca ||
      cli.name.toLowerCase().includes(termoBusca) ||
      cli.phone.toLowerCase().includes(termoBusca) ||
      cli.email.toLowerCase().includes(termoBusca) ||
      (cli.lastTrip && cli.lastTrip.toLowerCase().includes(termoBusca)) ||
      (cli.nextTrip && cli.nextTrip.toLowerCase().includes(termoBusca));

    return batePrioridade && bateBusca;
  });

  // opções de filtro de prioridade
  const opcoesFiltro: { id: FiltroPrioridade; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'alta', label: 'Alta' },
    { id: 'media', label: 'Média' },
    { id: 'baixa', label: 'Baixa' },
  ];

  // cadastro de novo cliente
  const handleCadastrarNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();

    // verificação caso esteja vazio
    if (!novoNome.trim()) return;

    const novoId = Math.max(...clientes.map((c) => c.id), 0) + 1;
    const novoCliente: Cliente = {
      id: novoId,
      name: novoNome.trim(),
      phone: novoTelefone.trim() || '(48) 99999-0000',
      email: novoEmail.trim() || `${novoNome.trim().toLowerCase().split(' ')[0]}@email.com`,
      profile: novoPerfil,
      lastTrip: null,
      nextTrip: novaProximaViagem.trim() || null,
      lastContact: '2026-08-30',
      priority: 'none',
      opportunity: null,
      registeredAt: '2026-08-30',
    };

    setClientes([novoCliente, ...clientes]);
    setModalNovoAberto(false);
    setNovoNome('');
    setNovoTelefone('');
    setNovoEmail('');
    setNovoPerfil('Família');
    setNovaProximaViagem('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clientes</h2>
          <p className="text-xs text-slate-500 mt-1">
            Carteira completa — {clientes.length} clientes cadastrados
          </p>
        </div>
        <button
          onClick={() => setModalNovoAberto(true)}
          className="inline-flex items-center cursor-pointer justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Plus size={16} />
          <span>Novo cliente</span>
        </button>
      </div>

      {/* barra de busca e filtros de prioridade */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* campo de busca */}
        <div className="relative flex-1 min-w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail..."
            className="w-full bg-white border rounded-xl pl-10 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
          />
        </div>

        {/* chips de prioridade */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {opcoesFiltro.map((opcao) => (
            <button
              key={opcao.id}
              onClick={() => setPrioridadeAtiva(opcao.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${prioridadeAtiva === opcao.id
                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>

      {/* tabela de clientes */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                <th className="py-3.5 px-4 sm:px-6">Cliente</th>
                <th className="py-3.5 px-4">Contato</th>
                <th className="py-3.5 px-4">Perfil</th>
                <th className="py-3.5 px-4">Última viagem</th>
                <th className="py-3.5 px-4">Próxima viagem</th>
                <th className="py-3.5 px-4">Último contato</th>
                <th className="py-3.5 px-4">Prioridade</th>
                <th className="py-3.5 px-4">Oportunidade</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <User className="w-8 h-8 text-slate-300" />
                      <p className="font-medium text-slate-600">Nenhum cliente encontrado</p>
                      <p className="text-xs text-slate-400">Tente buscar com outros termos ou remover os filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* coluna de cliente com avatar e responsável */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100/60 shadow-xs">
                          {extrairIniciais(cliente.name)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[13.5px] leading-snug group-hover:text-brand-primary transition-colors">
                            {cliente.name}
                          </div>
                          <div className="text-[11.5px] text-slate-400">Resp. Antônio</div>
                        </div>
                      </div>
                    </td>

                    {/* contato */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-800">{cliente.phone}</div>
                      <div className="text-[11.5px] text-slate-400">{cliente.email}</div>
                    </td>

                    {/* perfil */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                        {cliente.profile}
                      </span>
                    </td>

                    {/* última viagem */}
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {cliente.lastTrip || <span className="text-slate-300 font-bold">—</span>}
                    </td>

                    {/* próxima viagem */}
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {cliente.nextTrip || <span className="text-slate-300 font-bold">—</span>}
                    </td>

                    {/* último contato */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {calcularDiasAtras(cliente.lastContact)}
                    </td>

                    {/* prioridade */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cliente.priority === 'none' ? (
                        <span className="text-slate-300 font-bold">—</span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cliente.priority === 'alta'
                            ? 'text-red-600'
                            : cliente.priority === 'media'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${cliente.priority === 'alta'
                              ? 'bg-red-500'
                              : cliente.priority === 'media'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                              }`}
                          />
                          {cliente.priority === 'alta'
                            ? 'Alta'
                            : cliente.priority === 'media'
                              ? 'Média'
                              : 'Baixa'}
                        </span>
                      )}
                    </td>

                    {/* oportunidade */}
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {cliente.opportunity ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium bg-blue-50 text-brand-primary border border-blue-100">
                          {cliente.opportunity}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>

                    {/* ação */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setClienteDetalhes(cliente)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-brand-primary hover:border-brand-primary hover:bg-blue-50/30 transition-all cursor-pointer shadow-xs"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal de detalhes do cliente */}
      {clienteDetalhes && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* cabeçalho do modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary font-bold text-sm flex items-center justify-center border border-blue-100">
                  {extrairIniciais(clienteDetalhes.name)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{clienteDetalhes.name}</h3>
                  <p className="text-xs text-slate-400">Cliente #{clienteDetalhes.id} · Resp. Antônio</p>
                </div>
              </div>
              <button
                onClick={() => setClienteDetalhes(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* corpo do modal com informações */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                    <Phone size={13} className="text-slate-400" />
                    Telefone
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{clienteDetalhes.phone}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                    <Mail size={13} className="text-slate-400" />
                    E-mail
                  </div>
                  <div className="text-sm font-semibold text-slate-800 truncate" title={clienteDetalhes.email}>
                    {clienteDetalhes.email}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                    <User size={13} className="text-slate-400" />
                    Perfil de Viagem
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{clienteDetalhes.profile}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                    <AlertCircle size={13} className="text-slate-400" />
                    Prioridade
                  </div>
                  <div className="text-sm font-semibold capitalize text-slate-800">
                    {clienteDetalhes.priority === 'none' ? 'Sem prioridade' : clienteDetalhes.priority}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    Última Viagem:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {clienteDetalhes.lastTrip || 'Nenhum histórico'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    Próxima Viagem:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {clienteDetalhes.nextTrip || 'Não agendada'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    Último Contato:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {calcularDiasAtras(clienteDetalhes.lastContact)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    Cadastrado em:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {clienteDetalhes.registeredAt}
                  </span>
                </div>
              </div>

              {clienteDetalhes.opportunity && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <div className="text-xs font-semibold text-brand-primary mb-0.5">
                    Oportunidade Ativa vinculada
                  </div>
                  <p className="text-xs text-slate-600">
                    {clienteDetalhes.opportunity} em acompanhamento pelo vendedor.
                  </p>
                </div>
              )}
            </div>

            {/* rodapé do modal */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setClienteDetalhes(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  alert(`Iniciando contato com ${clienteDetalhes.name}...`);
                  setClienteDetalhes(null);
                }}
                className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-xs font-semibold text-white shadow-sm transition-all"
              >
                Registrar contato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal de novo cliente */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* cabeçalho do formulário */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Cadastrar Novo Cliente</h3>
              <button
                onClick={() => setModalNovoAberto(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* formulário */}
            <form onSubmit={handleCadastrarNovoCliente}>
              <div className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silveira"
                    className="w-full border rounded-xl px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={novoTelefone}
                      onChange={(e) => setNovoTelefone(e.target.value)}
                      placeholder="(48) 90000-0000"
                      className="w-full border rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Perfil
                    </label>
                    <select
                      value={novoPerfil}
                      onChange={(e) => setNovoPerfil(e.target.value as PerfilCliente)}
                      className="w-full border rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    >
                      <option value="Família">Família</option>
                      <option value="Casal">Casal</option>
                      <option value="Solo">Solo</option>
                      <option value="Negócios">Negócios</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full border rounded-xl px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Próxima Viagem / Destino de Interesse
                  </label>
                  <input
                    type="text"
                    value={novaProximaViagem}
                    onChange={(e) => setNovaProximaViagem(e.target.value)}
                    placeholder="Ex: Paris, França"
                    className="w-full border rounded-xl px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  />
                </div>
              </div>

              {/* botões de ação */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 rounded-xl border cursor-pointer border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center cursor-pointer gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-xs font-semibold text-white shadow-sm transition-all"
                >
                  <Check size={14} />
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}