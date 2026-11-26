import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../database/pool';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateBody } from '../../middlewares/validate';
import { AppError } from '../../utils/errors';

const router = Router();

const schema = z.object({
  id_cliente: z.number().int().positive(),
  id_oportunidade: z.number().int().positive().nullable().optional(),
  canal: z.enum(['WhatsApp', 'Telefone', 'E-mail', 'Presencial']),
  mensagem: z.string().min(1).max(5000),
  resultado: z.string().max(500).nullable().optional(),
  reagendar_dias: z.number().optional(),
  data_reagendamento: z.string().optional(),
  encerrar_oportunidade: z.boolean().optional(),
  nova_venda: z.object({
    id_destino: z.number().int().positive().optional().nullable(),
    nome_destino: z.string().optional().nullable(),
    data_ida: z.string().optional(),
    data_retorno: z.string().optional(),
    valor_total: z.number().positive(),
    forma_pagamento: z.string().min(2), // ex: 'Boleto', 'Cartão de Crédito', 'Pix'
    total_parcelas: z.number().int().min(1).max(24).default(1),
    entrada_paga: z.boolean().optional().default(false), // true se 1+Nx
    tipo_condicao: z.enum(['a_vista', '1_mais_10', 'direto_cartao', 'personalizado']).optional(), // <- adicione esta linha
  }).optional(),
  data_contato: z.string().datetime().optional(),
});

type ContatoPayload = z.infer<typeof schema>;

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const id = String(req.query.id_cliente || '');
    const r = await query(
      "SELECT ct.*, c.nome_cliente, v.nome vendedor FROM contato ct JOIN cliente c USING(id_cliente) LEFT JOIN vendedor v USING(id_vendedor) WHERE ($1='' OR ct.id_cliente=$1::int) ORDER BY ct.data_contato DESC LIMIT 500",
      [id]
    );
    res.json(r.rows);
  })
);

// executa acoes de reagendamento, encerramento de oportunidade e lancamento financeiro de nova venda
async function processarAcoesAposContato(
  idCliente: number,
  idOportunidade: number | null,
  b: ContatoPayload
) {
  // 1. se solicitou encerramento, fecha a oportunidade atual
  if (b.encerrar_oportunidade && idOportunidade) {
    await query(
      "UPDATE oportunidade SET status_oportunidade = 'encerrada', data_encerramento = now() WHERE id_oportunidade = $1",
      [idOportunidade]
    );
  }

  // 2. calcula data de reagendamento comercial (ex: +30, +60, +90 dias ou data no calendario)
  let dataReagendada: string | null = null;
  if (b.data_reagendamento) {
    dataReagendada = b.data_reagendamento;
  } else if (b.reagendar_dias && b.reagendar_dias > 0) {
    const d = new Date();
    d.setDate(d.getDate() + Number(b.reagendar_dias));
    dataReagendada = d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  }

  // aplica o reagendamento comercial
  if (dataReagendada) {
    if (b.encerrar_oportunidade || !idOportunidade) {
      await query(
        "INSERT INTO oportunidade(id_cliente, tipo_origem, descricao, data_proximo_contato, status_oportunidade) VALUES($1, 'manual', $2, $3, 'ativa')",
        [idCliente, `Retorno comercial programado: ${b.resultado || 'Acompanhamento'}`, dataReagendada]
      );
    } else {
      await query(
        "UPDATE oportunidade SET data_proximo_contato = $1, status_oportunidade = 'em_andamento' WHERE id_oportunidade = $2",
        [dataReagendada, idOportunidade]
      );
    }
  }

  // 3. registro completo da nova venda e geracao automatica de parcelas financeiras
  if (b.nova_venda && (b.nova_venda.id_destino || b.nova_venda.nome_destino)) {
    let idDestino = b.nova_venda.id_destino;
    if (!idDestino && b.nova_venda.nome_destino) {
      // busca se o destino ja existe ou insere novo
      const buscaDestino = await query(
        'SELECT id_destino FROM destino WHERE lower(nome_destino) = lower($1) LIMIT 1',
        [b.nova_venda.nome_destino.trim()]
      );

      if (buscaDestino.rows[0]) {
        idDestino = buscaDestino.rows[0].id_destino;
      } else {
        const novoDest = await query(
          'INSERT INTO destino(nome_destino) VALUES($1) RETURNING id_destino',
          [b.nova_venda.nome_destino.trim()]
        );
        idDestino = novoDest.rows[0]?.id_destino || null;
      }
    }

    if (idDestino) {
      const valorTotal = Number(b.nova_venda.valor_total) || 0;
      const totalParcelas = Math.max(1, Number(b.nova_venda.total_parcelas) || 1);
      const formaPagamento = b.nova_venda.forma_pagamento || 'Boleto';
      const isEntradaMaisN = b.nova_venda.tipo_condicao === '1_mais_10';

      // insere a nova viagem
      const viagemRes = await query(
        `INSERT INTO viagem(id_cliente, id_destino, data_ida, data_retorno, valor_total, tipo_viagem, status_viagem)
         VALUES($1, $2, coalesce($3::date, CURRENT_DATE + 60), coalesce($4::date, CURRENT_DATE + 67), $5, 'nacional', 'confirmada')
         RETURNING id_viagem`,
        [
          idCliente,
          idDestino,
          b.nova_venda.data_ida || null,
          b.nova_venda.data_retorno || null,
          valorTotal,
        ]
      );
      const idViagem = viagemRes.rows[0].id_viagem;

      // calcula data prevista da ultima parcela para a quitacao
      const dataQuitacaoPrevista = new Date();
      dataQuitacaoPrevista.setMonth(dataQuitacaoPrevista.getMonth() + (totalParcelas - 1));
      const quitacaoFormatada = dataQuitacaoPrevista.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

      const statusPagamento = totalParcelas === 1 && formaPagamento === 'Pix' ? 'quitado' : 'pendente';

      // insere o cabecalho de pagamento
      const pagRes = await query(
        `INSERT INTO pagamento(id_viagem, valor_total_pagamento, status_pagamento, forma_pagamento, data_quitacao)
         VALUES($1, $2, $3, $4, $5) RETURNING id_pagamento`,
        [
          idViagem,
          valorTotal,
          statusPagamento,
          formaPagamento,
          statusPagamento === 'quitado' ? new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) : quitacaoFormatada,
        ]
      );
      const idPagamento = pagRes.rows[0].id_pagamento;

      // gera as parcelas mensais proporcionais
      const valorParcela = parseFloat((valorTotal / totalParcelas).toFixed(2));
      for (let i = 1; i <= totalParcelas; i++) {
        const dataVenc = new Date();
        dataVenc.setMonth(dataVenc.getMonth() + (i - 1));
        const vencFormatado = dataVenc.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

        // se for entrada (1+Nx) ou a vista pago via Pix, parcela 1 nasce como 'pago'
        const isPrimeiraPaga = (i === 1 && (isEntradaMaisN || statusPagamento === 'quitado'));
        const statusParcela = isPrimeiraPaga ? 'pago' : 'pendente';

        await query(
          `INSERT INTO parcela_pagamento(id_pagamento, numero_parcela, valor_parcela, data_vencimento, data_pagamento, status_parcela)
           VALUES($1, $2, $3, $4, $5, $6)`,
          [
            idPagamento,
            i,
            valorParcela,
            vencFormatado,
            isPrimeiraPaga ? new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) : null,
            statusParcela,
          ]
        );
      }
    }
  }
}

router.post(
  '/',
  validateBody(schema),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const r = await query(
      'INSERT INTO contato(id_cliente, id_oportunidade, id_vendedor, canal, mensagem, resultado, data_contato) VALUES($1, $2, $3, $4, $5, $6, coalesce($7::timestamptz, now())) RETURNING *',
      [
        b.id_cliente,
        b.id_oportunidade || null,
        req.user?.id || null,
        b.canal,
        b.mensagem,
        b.resultado || null,
        b.data_contato || null,
      ]
    );

    await processarAcoesAposContato(b.id_cliente, b.id_oportunidade || null, b);

    res.status(201).json(r.rows[0]);
  })
);

router.post(
  '/:id_oportunidade/registrar',
  validateBody(schema.omit({ id_oportunidade: true })),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id_oportunidade);
    const b = req.body;
    const opportunity = await query(
      'SELECT id_oportunidade, id_cliente FROM oportunidade WHERE id_oportunidade=$1',
      [id]
    );

    // As oportunidades exibidas nesta versão ainda vêm de dados de demonstração.
    // Se o ID não existir no banco, registra o contato pelo cliente real e sem vínculo à oportunidade fictícia.
    let idCliente: number;
    let idOportunidade: number | null;
    if (opportunity.rows[0]) {
      idCliente = opportunity.rows[0].id_cliente;
      idOportunidade = opportunity.rows[0].id_oportunidade;
    } else {
      const client = await query(
        'SELECT id_cliente FROM cliente WHERE id_cliente=$1 AND ativo=true',
        [b.id_cliente]
      );
      if (!client.rows[0]) {
        throw new AppError(404, 'Cliente não encontrado para registrar o contato');
      }
      idCliente = client.rows[0].id_cliente;
      idOportunidade = null;
    }

    const r = await query(
      'INSERT INTO contato(id_cliente, id_oportunidade, id_vendedor, canal, mensagem, resultado, data_contato) VALUES($1, $2, $3, $4, $5, $6, coalesce($7::timestamptz, now())) RETURNING *',
      [
        idCliente,
        idOportunidade,
        req.user?.id || null,
        b.canal,
        b.mensagem,
        b.resultado || null,
        b.data_contato || null,
      ]
    );

    await processarAcoesAposContato(idCliente, idOportunidade, b);

    res.status(201).json(r.rows[0]);
  })
);

export default router;
