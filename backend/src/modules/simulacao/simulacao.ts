import { Router } from 'express';
import { query, transaction } from '../../database/pool';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/errors';
import { horaAtualBR } from '../../utils/date';
import { gerarOportunidades } from '../oportunidades/oportunidades';

const router = Router();

/*
 * Simulação de cenários para demonstração.
 *
 * Cria um cliente de teste (identificado como "Simulação") com viagem, pagamento e parcelas
 * em datas fictícias calculadas a partir de hoje, e em seguida executa o cruzador real.
 * Assim a oportunidade nasce pela mesma regra usada no agendador diário, sem alterar nenhuma
 * regra existente. Os offsets abaixo são em dias, relativos a CURRENT_DATE do banco.
 */
interface ParcelaSimulada {
  numero: number;
  valor: number;
  vencimento: number;
  paga: boolean;
}

interface Cenario {
  titulo: string;
  ida: number;
  retorno: number;
  valorTotal: number;
  parcelas: ParcelaSimulada[];
}

const CENARIOS: Record<string, Cenario> = {
  // Retorno há 2 dias e última parcela ainda em aberto e no futuro: só a regra pós-viagem dispara.
  'pos-viagem': {
    titulo: 'pós-viagem',
    ida: -9,
    retorno: -2,
    valorTotal: 4500,
    parcelas: [
      { numero: 1, valor: 1500, vencimento: -40, paga: true },
      { numero: 2, valor: 1500, vencimento: -10, paga: true },
      { numero: 3, valor: 1500, vencimento: 30, paga: false },
    ],
  },
  // Viagem ainda no futuro e última parcela paga: só a regra de fim de pagamento dispara.
  'fim-pagamento': {
    titulo: 'fim de pagamento',
    ida: 10,
    retorno: 17,
    valorTotal: 3600,
    parcelas: [
      { numero: 1, valor: 1200, vencimento: -60, paga: true },
      { numero: 2, valor: 1200, vencimento: -30, paga: true },
      { numero: 3, valor: 1200, vencimento: 0, paga: true },
    ],
  },
};

router.post(
  '/:cenario',
  asyncHandler(async (req, res) => {
    const cenario = CENARIOS[String(req.params.cenario)];
    if (!cenario) {
      throw new AppError(404, 'Cenário de simulação não encontrado');
    }

    const hora = horaAtualBR();
    const nome = `Simulação ${cenario.titulo} ${hora}`;

    const idCliente = await transaction(async (c) => {
      // usa destinos já cadastrados; se não houver nenhum, cria um destino de simulação
      const destinos = await c.query('SELECT id_destino FROM destino ORDER BY random() LIMIT 2');
      let idDestino: number;
      let idInteresse: number;
      if (destinos.rows.length) {
        idDestino = destinos.rows[0].id_destino;
        idInteresse = (destinos.rows[1] || destinos.rows[0]).id_destino;
      } else {
        const d = await c.query(
          "INSERT INTO destino(nome_destino,cidade,pais) VALUES('Destino de simulação','Simulação','Brasil') RETURNING id_destino"
        );
        idDestino = idInteresse = d.rows[0].id_destino;
      }

      const cli = await c.query(
        "INSERT INTO cliente(nome_cliente,tipo_situacao,ativo) VALUES($1,'ja_atendido',true) RETURNING id_cliente",
        [nome]
      );
      const id = cli.rows[0].id_cliente;

      const via = await c.query(
        "INSERT INTO viagem(id_cliente,id_destino,data_ida,data_retorno,valor_total,tipo_viagem,status_viagem) VALUES($1,$2,CURRENT_DATE + $3::int,CURRENT_DATE + $4::int,$5,'nacional','confirmada') RETURNING id_viagem",
        [id, idDestino, cenario.ida, cenario.retorno, cenario.valorTotal]
      );

      const todasPagas = cenario.parcelas.every((p) => p.paga);
      const algumaPaga = cenario.parcelas.some((p) => p.paga);
      const pag = await c.query(
        `INSERT INTO pagamento(id_viagem,valor_total_pagamento,status_pagamento,forma_pagamento,data_quitacao)
         VALUES($1,$2,$3,'Simulação',${todasPagas ? 'CURRENT_DATE' : 'NULL'}) RETURNING id_pagamento`,
        [via.rows[0].id_viagem, cenario.valorTotal, todasPagas ? 'quitado' : algumaPaga ? 'parcial' : 'pendente']
      );

      for (const p of cenario.parcelas) {
        await c.query(
          `INSERT INTO parcela_pagamento(id_pagamento,numero_parcela,valor_parcela,data_vencimento,data_pagamento,status_parcela)
           VALUES($1,$2,$3,CURRENT_DATE + $4::int,${p.paga ? 'CURRENT_DATE + $4::int' : 'NULL'},$5)`,
          [pag.rows[0].id_pagamento, p.numero, p.valor, p.vencimento, p.paga ? 'pago' : 'pendente']
        );
      }

      await c.query(
        "INSERT INTO cliente_interesse(id_cliente,id_destino,descricao_interesse) VALUES($1,$2,'Interesse de simulação')",
        [id, idInteresse]
      );

      return id as number;
    });

    // executa o cruzador real, depois de gravar os dados da simulação
    await gerarOportunidades();

    const ops = await query(
      'SELECT id_oportunidade, tipo_origem, descricao FROM oportunidade WHERE id_cliente=$1 ORDER BY id_oportunidade',
      [idCliente]
    );

    res.status(201).json({
      cenario: cenario.titulo,
      cliente: { id_cliente: idCliente, nome_cliente: nome },
      oportunidades: ops.rows,
    });
  })
);

export default router;
