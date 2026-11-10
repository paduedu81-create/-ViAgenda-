import app from './app';
import { env } from './config/env';
import { pool } from './database/pool';
import { startOpportunityJob } from './jobs/opportunity.job';

async function main() {
  await pool.query('SELECT 1');

  const server = app.listen(env.PORT, () => {
    console.info(`ViAgenda API disponível em http://localhost:${env.PORT}`);
  });

  if (env.NODE_ENV !== 'test') {
    startOpportunityJob();
  }

  const close = async () => {
    server.close();
    await pool.end();
    process.exit(0);
  };

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}

main().catch((e) => {
  console.error('Falha ao iniciar ViAgenda:', e);
  process.exit(1);
});
