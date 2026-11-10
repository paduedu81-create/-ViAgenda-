import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../database/pool';
import { validateBody } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/errors';

const router = Router();

const schema = z.object({
  nome_destino: z.string().min(2),
  cidade: z.string().nullable().optional(),
  pais: z.string().nullable().optional(),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const b = String(req.query.busca || '');
    const r = await query(
      "SELECT * FROM destino WHERE ($1='' OR nome_destino ILIKE $2 OR coalesce(cidade,'') ILIKE $2 OR coalesce(pais,'') ILIKE $2) ORDER BY nome_destino",
      [b, `%${b}%`]
    );
    res.json(r.rows);
  })
);

router.post(
  '/',
  validateBody(schema),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const r = await query(
      'INSERT INTO destino(nome_destino,cidade,pais) VALUES($1,$2,$3) RETURNING *',
      [b.nome_destino, b.cidade || null, b.pais || null]
    );
    res.status(201).json(r.rows[0]);
  })
);

router.patch(
  '/:id',
  validateBody(schema.partial()),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const keys = Object.keys(b);
    if (!keys.length) {
      throw new AppError(400, 'Informe campos');
    }

    const cols = ['nome_destino', 'cidade', 'pais'];
    const vals = keys.map((k) => b[k]);
    const sets = keys.map((k, i) => `${k}=$${i + 1}`);

    if (keys.some((k) => !cols.includes(k))) {
      throw new AppError(400, 'Campo inválido');
    }

    const r = await query(
      `UPDATE destino SET ${sets.join(',')} WHERE id_destino=$${keys.length + 1} RETURNING *`,
      [...vals, req.params.id]
    );

    if (!r.rows[0]) {
      throw new AppError(404, 'Destino não encontrado');
    }

    res.json(r.rows[0]);
  })
);

export default router;
