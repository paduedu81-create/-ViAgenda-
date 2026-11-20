-- Interesses de viagem por pais (dados de exemplo).
-- Cria 6 destinos (um por pais) e da 1, 2 ou 3 paises de interesse para cada cliente que ainda nao tem interesse.
-- Cada cliente recebe paises diferentes entre si; entre clientes os paises se repetem e se intercalam.
-- Pode rodar mais de uma vez: remove os interesses de exemplo anteriores e recria.
-- Execute no SQL Editor do Supabase.

BEGIN;

-- 1) seis destinos, um por pais (so cria se ainda nao existir)
INSERT INTO destino (nome_destino, cidade, pais)
SELECT v.nome_destino, v.cidade, v.pais
FROM (VALUES
  ('Toronto',      'Toronto',      'Canadá'),
  ('Lisboa',       'Lisboa',       'Portugal'),
  ('Tóquio',       'Tóquio',       'Japão'),
  ('Roma',         'Roma',         'Itália'),
  ('Buenos Aires', 'Buenos Aires', 'Argentina'),
  ('Cancún',       'Cancún',       'México')
) AS v(nome_destino, cidade, pais)
WHERE NOT EXISTS (
  SELECT 1 FROM destino d WHERE d.nome_destino = v.nome_destino AND d.pais = v.pais
);

-- 2) apaga so os interesses de exemplo criados antes por este script
DELETE FROM cliente_interesse WHERE descricao_interesse LIKE 'Interesse (exemplo) em %';

-- 3) cliente 1 -> 1 pais, cliente 2 -> 2 paises, cliente 3 -> 3 paises, cliente 4 -> 1 pais...
--    os paises andam em sequencia (0..5) e voltam ao inicio, entao se repetem e se intercalam
WITH paises AS (
  SELECT p.ordem, p.pais, min(d.id_destino) AS id_destino
  FROM (VALUES
    (0, 'Toronto',      'Canadá'),
    (1, 'Lisboa',       'Portugal'),
    (2, 'Tóquio',       'Japão'),
    (3, 'Roma',         'Itália'),
    (4, 'Buenos Aires', 'Argentina'),
    (5, 'Cancún',       'México')
  ) AS p(ordem, nome_destino, pais)
  JOIN destino d ON d.nome_destino = p.nome_destino AND d.pais = p.pais
  GROUP BY p.ordem, p.pais
),
clientes AS (
  SELECT c.id_cliente, (row_number() OVER (ORDER BY c.id_cliente) - 1)::int AS rn
  FROM cliente c
  WHERE c.ativo = true
    AND NOT EXISTS (SELECT 1 FROM cliente_interesse i WHERE i.id_cliente = c.id_cliente)
)
INSERT INTO cliente_interesse (id_cliente, id_destino, descricao_interesse)
SELECT c.id_cliente, p.id_destino, 'Interesse (exemplo) em ' || p.pais
FROM clientes c
CROSS JOIN generate_series(0, 2) AS j
JOIN paises p ON p.ordem = (c.rn + j) % 6
WHERE j < (c.rn % 3) + 1;

COMMIT;

-- 4) conferencia: quantos clientes por pais
SELECT d.pais, count(DISTINCT ci.id_cliente) AS clientes
FROM cliente_interesse ci
JOIN destino d USING (id_destino)
WHERE ci.descricao_interesse LIKE 'Interesse (exemplo) em %'
GROUP BY d.pais
ORDER BY d.pais;
