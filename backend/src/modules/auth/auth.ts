import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../../database/pool';
import { env } from '../../config/env';
import { authenticate, authorize } from '../../middlewares/auth';
import { validateBody } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/errors';

const router = Router();
const login = z.object({ email: z.string().email(), senha: z.string().min(1) });
const schema = z.object({ nome: z.string().min(2), email: z.string().email(), senha: z.string().min(8), perfil: z.enum(['admin', 'vendedor']).default('vendedor') });

function adminConfigured() {
  return Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH && env.ADMIN_NAME);
}

router.post('/login', validateBody(login), asyncHandler(async (req, res) => {
  const email = String(req.body.email).toLowerCase();

  // Conta administrativa local: autentica sem depender da tabela vendedor no Supabase.
  if (adminConfigured() && email === env.ADMIN_EMAIL!.toLowerCase()) {
    const valid = await bcrypt.compare(req.body.senha, env.ADMIN_PASSWORD_HASH!);
    if (!valid) throw new AppError(401, 'E-mail ou senha incorretos');
    const usuario = { id: 0, nome: env.ADMIN_NAME!, email: env.ADMIN_EMAIL!, perfil: 'admin' };
    const token = jwt.sign(usuario, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
    return res.json({ token, usuario });
  }

  // Mantém suporte a vendedores armazenados no banco caso essa tabela já exista.
  try {
    const r = await query('SELECT * FROM vendedor WHERE lower(email)=lower($1) AND ativo=true', [email]);
    const u = r.rows[0];
    if (!u || !(await bcrypt.compare(req.body.senha, u.senha_hash))) throw new AppError(401, 'E-mail ou senha incorretos');
    await query('UPDATE vendedor SET ultimo_login=now() WHERE id_vendedor=$1', [u.id_vendedor]);
    const usuario = { id: u.id_vendedor, nome: u.nome, email: u.email, perfil: u.perfil };
    const token = jwt.sign(usuario, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
    return res.json({ token, usuario });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    if (error?.code === '42P01') throw new AppError(401, 'E-mail ou senha incorretos');
    throw error;
  }
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  if (req.user!.id === 0 && adminConfigured()) {
    return res.json({ id: 0, nome: env.ADMIN_NAME, email: env.ADMIN_EMAIL, perfil: 'admin', ativo: true });
  }
  const r = await query('SELECT id_vendedor id,nome,email,perfil,ativo FROM vendedor WHERE id_vendedor=$1 AND ativo=true', [req.user!.id]);
  if (!r.rows[0]) throw new AppError(404, 'Usuário não encontrado');
  return res.json(r.rows[0]);
}));

router.post('/vendedores', authenticate, authorize('admin'), validateBody(schema), asyncHandler(async (req, res) => {
  const hash = await bcrypt.hash(req.body.senha, 12);
  const r = await query('INSERT INTO vendedor(nome,email,senha_hash,perfil) VALUES($1,$2,$3,$4) RETURNING id_vendedor,nome,email,perfil,ativo', [req.body.nome, req.body.email, hash, req.body.perfil]);
  res.status(201).json(r.rows[0]);
}));
export default router;
