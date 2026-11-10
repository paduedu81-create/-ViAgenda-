import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../database/pool';
import { validateBody } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/errors';

const router = Router();

const situacao = z.enum([
  'ja_atendido',
  'orcamento_aberto',
  'nao_contatar',
  'insatisfeito',
  'outro',
]);

const schema = z.object({
  nome_cliente: z.string().min(2),
  cpf_cnpj: z.string().nullable().optional(),
  email: z.union([z.string().email(), z.literal('')]).nullable().optional(),
  telefone: z.string().nullable().optional(),
  data_nascimento: z.string().date().nullable().optional(),
  tipo_situacao: situacao.default('outro'),
  ativo: z.boolean().optional(),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const busca = String(req.query.busca || '');
    const situacao = String(req.query.situacao || '') || null;
    const ativo = req.query.ativo === undefined ? true : req.query.ativo === 'true';
    const pagina = Math.max(1, Number(req.query.pagina || 1));
    const limite = Math.min(100, Math.max(1, Number(req.query.limite || 20)));
    const args = [`%${busca}%`, situacao, ativo, limite, (pagina - 1) * limite];

    const where = `($1='%%' OR c.nome_cliente ILIKE $1 OR coalesce(c.email,'') ILIKE $1 OR coalesce(c.telefone,'') ILIKE $1 OR coalesce(c.cpf_cnpj,'') ILIKE $1) AND ($2::text IS NULL OR c.tipo_situacao=$2) AND c.ativo=$3`;

    const [data, count] = await Promise.all([
      query(
        `SELECT c.*,
          (SELECT count(*)::int FROM viagem v WHERE v.id_cliente=c.id_cliente AND v.status_viagem<>'cancelada') total_viagens,
          (SELECT max(v.data_retorno) FROM viagem v WHERE v.id_cliente=c.id_cliente AND v.status_viagem<>'cancelada') ultima_viagem,
          (SELECT min(v.data_ida) FROM viagem v WHERE v.id_cliente=c.id_cliente AND v.status_viagem='confirmada' AND v.data_ida>=CURRENT_DATE) proxima_viagem,
          (SELECT max(ct.data_contato) FROM contato ct WHERE ct.id_cliente=c.id_cliente) ultimo_contato
        FROM cliente c
        WHERE ${where}
        ORDER BY c.nome_cliente
        LIMIT $4 OFFSET $5`,
        args
      ),
      query(`SELECT count(*)::int total FROM cliente c WHERE ${where}`, args.slice(0, 3)),
    ]);

    res.json({
      dados: data.rows,
      paginacao: {
        pagina,
        limite,
        total: count.rows[0].total,
        paginas: Math.ceil(count.rows[0].total / limite),
      },
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const r = await query(
      `SELECT c.*,
        (SELECT coalesce(json_agg(json_build_object('id_viagem',v.id_viagem,'id_destino',v.id_destino,'destino',d.nome_destino,'data_ida',v.data_ida,'data_retorno',v.data_retorno,'valor_total',v.valor_total,'status_viagem',v.status_viagem) ORDER BY v.data_ida DESC),'[]')
         FROM viagem v LEFT JOIN destino d USING(id_destino) WHERE v.id_cliente=c.id_cliente) viagens,
        (SELECT coalesce(json_agg(json_build_object('id_interesse',i.id_interesse,'id_destino',d.id_destino,'nome_destino',d.nome_destino,'descricao_interesse',i.descricao_interesse) ORDER BY i.data_registro DESC),'[]')
         FROM cliente_interesse i JOIN destino d USING(id_destino) WHERE i.id_cliente=c.id_cliente) interesses,
        (SELECT coalesce(json_agg(ct ORDER BY ct.data_contato DESC),'[]')
         FROM contato ct WHERE ct.id_cliente=c.id_cliente) contatos
      FROM cliente c
      WHERE c.id_cliente=$1`,
      [req.params.id]
    );

    if (!r.rows[0]) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    res.json(r.rows[0]);
  })
);

router.post(
  '/',
  validateBody(schema),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const r = await query(
      'INSERT INTO cliente(nome_cliente,cpf_cnpj,email,telefone,data_nascimento,tipo_situacao,ativo) VALUES($1,$2,$3,$4,$5,$6,coalesce($7,true)) RETURNING *',
      [
        b.nome_cliente,
        b.cpf_cnpj || null,
        b.email || null,
        b.telefone || null,
        b.data_nascimento || null,
        b.tipo_situacao,
        b.ativo,
      ]
    );
    res.status(201).json(r.rows[0]);
  })
);

router.patch(
  '/:id',
  validateBody(schema.partial()),
  asyncHandler(async (req, res) => {
    const keys = Object.keys(req.body);
    if (!keys.length) {
      throw new AppError(400, 'Informe ao menos um campo');
    }

    const allowed = [
      'nome_cliente',
      'cpf_cnpj',
      'email',
      'telefone',
      'data_nascimento',
      'tipo_situacao',
      'ativo',
    ];
    const validKeys = keys.filter((k) => allowed.includes(k));
    const vals = validKeys.map((k) => req.body[k]);
    const sets = validKeys.map((k, i) => `${k}=$${i + 1}`);

    if (!sets.length) {
      throw new AppError(400, 'Nenhum campo permitido');
    }

    const r = await query(
      `UPDATE cliente SET ${sets.join(',')} WHERE id_cliente=$${vals.length + 1} RETURNING *`,
      [...vals, req.params.id]
    );

    if (!r.rows[0]) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    res.json(r.rows[0]);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const r = await query('UPDATE cliente SET ativo=false WHERE id_cliente=$1 RETURNING *', [
      req.params.id,
    ]);

    if (!r.rows[0]) {
      throw new AppError(404, 'Cliente não encontrado');
    }

    res.json(r.rows[0]);
  })
);

export default router;
