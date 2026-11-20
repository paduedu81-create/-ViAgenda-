import { Pool, PoolClient, QueryResult, QueryResultRow, types } from 'pg';
import { env } from '../config/env';

// forca o parser do pg para colunas DATE (oid 1082) retornar string YYYY-MM-DD pura
types.setTypeParser(1082, (val: string) => val);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (e) => {
  console.error('Erro inesperado no pool PostgreSQL:', e);
});

// garante fuso horario de brasilia em cada conexao adquirida do pool
async function obterClienteComFuso(): Promise<PoolClient> {
  const client = await pool.connect();
  if (!(client as any).__tzSet) {
    await client.query("SET timezone = 'America/Sao_Paulo'");
    (client as any).__tzSet = true;
  }
  return client;
}

export const query = async <T extends QueryResultRow = any>(
  sql: string,
  params: unknown[] = []
): Promise<QueryResult<T>> => {
  const client = await obterClienteComFuso();
  try {
    return await client.query<T>(sql, params);
  } finally {
    client.release();
  }
};

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const c = await obterClienteComFuso();
  try {
    await c.query('BEGIN');
    const result = await fn(c);
    await c.query('COMMIT');
    return result;
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}
