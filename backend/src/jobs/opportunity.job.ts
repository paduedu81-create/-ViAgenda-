import cron from 'node-cron';
import { env } from '../config/env';
import { gerarOportunidades } from '../modules/oportunidades/oportunidades';

export function startOpportunityJob() {
  cron.schedule(
    '0 6 * * *',
    async () => {
      try {
        console.info('[CRON] Cruzador de oportunidades:', await gerarOportunidades());
      } catch (e) {
        console.error('[CRON] Falha no cruzador:', e);
      }
    },
    { timezone: env.CRON_TIMEZONE }
  );
}
