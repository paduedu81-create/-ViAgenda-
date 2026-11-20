// utilitarios de data e hora para padronizacao no fuso horario de brasilia

// retorna a data atual no formato YYYY-MM-DD considerando o fuso de brasilia
export function hojeBR(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

// retorna a hora atual no formato HH:mm considerando o fuso de brasilia
export function horaAtualBR(): string {
  return new Date().toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });
}
