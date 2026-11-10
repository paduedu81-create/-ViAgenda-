import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/env';
export const pool=new Pool({connectionString:env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:10,idleTimeoutMillis:30000,connectionTimeoutMillis:10000});
pool.on('error',e=>console.error('Erro inesperado no pool PostgreSQL:',e));
export const query=<T extends QueryResultRow=any>(sql:string,params:unknown[]=[]):Promise<QueryResult<T>>=>pool.query<T>(sql,params);
export async function transaction<T>(fn:(client:PoolClient)=>Promise<T>):Promise<T>{const c=await pool.connect();try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
