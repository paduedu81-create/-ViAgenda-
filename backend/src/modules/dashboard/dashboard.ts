import { Router } from 'express';
import { query } from '../../database/pool';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [clientes, op, contatos, proximos, viagens] = await Promise.all([
      query('SELECT count(*)::int total FROM cliente WHERE ativo=true'),
      query("SELECT count(*)::int total FROM oportunidade WHERE status_oportunidade IN('ativa','em_andamento')"),
      query("SELECT count(*)::int total FROM contato WHERE date_trunc('month',data_contato)=date_trunc('month',now())"),
      query(
        `SELECT o.id_oportunidade,
          o.data_proximo_contato,
          o.tipo_origem,
          o.descricao,
          o.status_oportunidade,
          c.id_cliente,
          c.nome_cliente,
          c.telefone,
          (
            SELECT string_agg(d.nome_destino, ', ')
            FROM cliente_interesse ci
            JOIN destino d USING(id_destino)
            WHERE ci.id_cliente=c.id_cliente
          ) interesses
        FROM oportunidade o
        JOIN cliente c USING(id_cliente)
        WHERE o.status_oportunidade IN('ativa','em_andamento')
        ORDER BY o.data_proximo_contato NULLS LAST, o.data_geracao DESC
        LIMIT 10`
      ),
      query("SELECT count(*)::int total FROM viagem WHERE status_viagem='confirmada' AND data_ida>=CURRENT_DATE"),
    ]);

    res.json({
      metricas: {
        clientes: clientes.rows[0].total,
        oportunidades_ativas: op.rows[0].total,
        contatos_mes: contatos.rows[0].total,
        viagens_futuras: viagens.rows[0].total,
      },
      proximos_contatos: proximos.rows,
    });
  })
);

export default router;
