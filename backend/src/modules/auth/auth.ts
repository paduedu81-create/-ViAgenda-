import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { query } from '../../database/pool';
import { env } from '../../config/env';
import { authenticate, authorize } from '../../middlewares/auth';
import { validateBody } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/errors';
import { enviarEmailRecuperacaoSenha } from '../../services/emailService';

const router = Router();

const login = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

const schema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8),
  perfil: z.enum(['admin', 'vendedor']).default('vendedor'),
});

const esqueciSenhaSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
});

const redefinirSenhaSchema = z.object({
  token: z.string().min(1, 'Token não fornecido'),
  novaSenha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

function adminConfigured() {
  return Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH && env.ADMIN_NAME);
}

router.post(
  '/login',
  validateBody(login),
  asyncHandler(async (req, res) => {
    const email = String(req.body.email).toLowerCase();

    // Conta administrativa local: autentica sem depender da tabela vendedor no Supabase.
    if (adminConfigured() && email === env.ADMIN_EMAIL!.toLowerCase()) {
      const valid = await bcrypt.compare(req.body.senha, env.ADMIN_PASSWORD_HASH!);
      if (!valid) {
        throw new AppError(401, 'E-mail ou senha incorretos');
      }

      const usuario = {
        id: 0,
        nome: env.ADMIN_NAME!,
        email: env.ADMIN_EMAIL!,
        perfil: 'admin',
      };

      const token = jwt.sign(usuario, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      });

      return res.json({ token, usuario });
    }

    // Mantém suporte a vendedores armazenados no banco caso essa tabela já exista.
    try {
      const r = await query(
        'SELECT * FROM vendedor WHERE lower(email)=lower($1) AND ativo=true',
        [email]
      );
      const u = r.rows[0];

      if (!u || !(await bcrypt.compare(req.body.senha, u.senha_hash))) {
        throw new AppError(401, 'E-mail ou senha incorretos');
      }

      await query('UPDATE vendedor SET ultimo_login=now() WHERE id_vendedor=$1', [u.id_vendedor]);

      const usuario = {
        id: u.id_vendedor,
        nome: u.nome,
        email: u.email,
        perfil: u.perfil,
      };

      const token = jwt.sign(usuario, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      });

      return res.json({ token, usuario });
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error?.code === '42P01') throw new AppError(401, 'E-mail ou senha incorretos');
      throw error;
    }
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user!.id === 0 && adminConfigured()) {
      return res.json({
        id: 0,
        nome: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        perfil: 'admin',
        ativo: true,
      });
    }

    const r = await query(
      'SELECT id_vendedor id, nome, email, perfil, ativo FROM vendedor WHERE id_vendedor=$1 AND ativo=true',
      [req.user!.id]
    );

    if (!r.rows[0]) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    return res.json(r.rows[0]);
  })
);

router.post(
  '/vendedores',
  authenticate,
  authorize('admin'),
  validateBody(schema),
  asyncHandler(async (req, res) => {
    const hash = await bcrypt.hash(req.body.senha, 12);
    const r = await query(
      'INSERT INTO vendedor(nome, email, senha_hash, perfil) VALUES($1, $2, $3, $4) RETURNING id_vendedor, nome, email, perfil, ativo',
      [req.body.nome, req.body.email, hash, req.body.perfil]
    );
    res.status(201).json(r.rows[0]);
  })
);

router.post(
  '/esqueci-senha',
  validateBody(esqueciSenhaSchema),
  asyncHandler(async (req, res) => {
    const email = String(req.body.email).toLowerCase();

    // checa se o usuario existe sem expor isso para o cliente
    let usuarioExiste = false;

    if (adminConfigured() && email === env.ADMIN_EMAIL!.toLowerCase()) {
      usuarioExiste = true;
    } else {
      try {
        const r = await query(
          'SELECT id_vendedor FROM vendedor WHERE lower(email)=lower($1) AND ativo=true',
          [email]
        );
        if (r.rows[0]) {
          usuarioExiste = true;
        }
      } catch {
        // caso a tabela nao exista no supabase, mantem falso
      }
    }

    if (usuarioExiste) {
      // gera token efemero valido por 15 minutos
      const token = jwt.sign(
        { email, tipo: 'recuperacao_senha' },
        env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const linkRedefinicao = `${env.CORS_ORIGIN}/redefinir-senha?token=${token}`;

      // envia email via resend ou imprime no console caso nao haja chave configurada
      await enviarEmailRecuperacaoSenha(email, linkRedefinicao);
    }

    // resposta neutra seguindo diretrizes owasp contra enumeracao de contas
    return res.json({
      mensagem: 'Se o e-mail informado estiver cadastrado, as instruções para redefinição foram enviadas.',
    });
  })
);

router.post(
  '/redefinir-senha',
  validateBody(redefinirSenhaSchema),
  asyncHandler(async (req, res) => {
    const { token, novaSenha } = req.body;

    let payload: { email: string; tipo: string };
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as { email: string; tipo: string };
    } catch {
      throw new AppError(400, 'Link de redefinição inválido ou expirado. Solicite um novo link.');
    }

    if (payload.tipo !== 'recuperacao_senha' || !payload.email) {
      throw new AppError(400, 'Token inválido para esta operação.');
    }

    const email = payload.email.toLowerCase();
    const hash = await bcrypt.hash(novaSenha, 12);

    // atualiza o hash do administrador no arquivo .env local
    if (adminConfigured() && email === env.ADMIN_EMAIL!.toLowerCase()) {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');
        const line = `ADMIN_PASSWORD_HASH=${hash}`;
        const re = /^ADMIN_PASSWORD_HASH=.*$/m;
        content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
        fs.writeFileSync(envPath, content, 'utf8');
      }
      (env as any).ADMIN_PASSWORD_HASH = hash;
      return res.json({ mensagem: 'Senha redefinida com sucesso!' });
    }

    // atualiza o hash do vendedor no banco de dados
    const r = await query(
      'UPDATE vendedor SET senha_hash=$1 WHERE lower(email)=lower($2) AND ativo=true RETURNING id_vendedor',
      [hash, email]
    );

    if (!r.rows[0]) {
      throw new AppError(404, 'Usuário não encontrado.');
    }

    return res.json({ mensagem: 'Senha redefinida com sucesso!' });
  })
);

export default router;
