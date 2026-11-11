// extrai iniciais do nome completo (primeira e última inicial)
export function extrairIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// calcula tempo relativo em dias a partir da data de contato
export function calcularDiasAtras(dataStr?: string | null): string {
  if (!dataStr || dataStr === 'Sem contato' || dataStr === '—') return 'Sem contato';

  const dataContato = new Date(dataStr);
  if (isNaN(dataContato.getTime())) return 'Sem contato';

  const dataHoje = new Date();
  const diffTempo = dataHoje.getTime() - dataContato.getTime();
  const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));

  if (diffDias <= 0) return 'Hoje';
  if (diffDias === 1) return '1 dia atrás';
  return `${diffDias} dias atrás`;
}
