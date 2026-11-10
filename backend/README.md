# ViAgenda — Back-end

API REST em Node.js, TypeScript, Express e PostgreSQL (Supabase). Compatível com o esquema-base enviado pelo projeto e com a migração complementar `database/migrations/001_viagenda_complementos.sql`.

## 1. Preparação

1. Copie `.env.example` para `.env` e configure `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGIN`.
2. Não coloque `.env` no Git. Se uma senha de banco já foi compartilhada, troque-a no Supabase.
3. A conta inicial de administrador é armazenada localmente no `.env` do backend, com hash bcrypt. Isso não cria tabelas nem altera o Supabase. Algumas funções de histórico de contatos e cadastro de vendedores dependem das tabelas complementares; sem elas, essas funções específicas não ficam disponíveis.

## 2. Instalação e execução

```bash
npm install
npm run typecheck
npm run dev
```

API: `http://localhost:3001/api`  
Saúde: `GET /api/health`  
Documentação: `http://localhost:3001/api/docs`

Criar o primeiro administrador:

```bash
npm run admin:create -- "Administrador" admin@viagenda.com "SenhaForte123"
```

O comando grava nome, e-mail e hash bcrypt no `.env` local. Reinicie o backend depois de criar a conta. Login: `POST /api/auth/login` com `{ "email": "...", "senha": "..." }`. Envie o token retornado em `Authorization: Bearer TOKEN` nas demais rotas.

## 3. Rotas

- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/vendedores` (admin)
- `GET/POST /api/clientes`, `GET/PATCH/DELETE /api/clientes/:id`
- `GET/POST /api/destinos`, `PATCH /api/destinos/:id`
- `POST /api/vendas` — cria/associa cliente, viagem, pagamento, parcelas e interesses em transação única
- `GET /api/pagamentos/viagem/:id`, `PATCH /api/pagamentos/parcelas/:id`
- `GET /api/interesses/cliente/:id`, `POST /api/interesses`, `DELETE /api/interesses/:id`
- `GET /api/oportunidades`, `PATCH /api/oportunidades/:id`, `POST /api/oportunidades/:id/encerrar`
- `POST /api/oportunidades/executar-cruzador` — execução manual do cruzador
- `GET/POST /api/contatos`, `POST /api/contatos/:id_oportunidade/registrar`
- `GET /api/dashboard`, `GET /api/relatorios?de=AAAA-MM-DD&ate=AAAA-MM-DD`

## 4. Regras implementadas

- Pós-viagem: quando a data de retorno já passou, gera o primeiro alerta; após isso, programa um novo ciclo mensal. A chave única por viagem/ciclo evita duplicidade em execuções repetidas.
- Fim do pagamento: verifica a parcela com maior `numero_parcela`; gera oportunidade quando essa parcela está paga **ou** quando sua data de vencimento chegou. Essa implementação segue literalmente o documento de regras enviado. Se a intenção for exigir quitação efetiva, o comportamento deve mudar para `status_parcela='pago'`.
- Ao consultar oportunidades, o sistema retorna também destinos e descrições de interesse associados ao cliente.
- Clientes inativos e clientes com `tipo_situacao='nao_contatar'` não recebem novas oportunidades automáticas.
- O agendador executa diariamente às 06:00 no fuso `America/Sao_Paulo`.

## 5. Limites do esquema e decisões conscientes

O esquema-base não possui prioridade, pontuação, pesos de critérios, perfil comercial, nem uma tabela de contatos/vendedores. A migração acrescenta somente o necessário para autenticação, histórico de contatos e origem/descrição/agendamento das oportunidades. **Não foi inventada fórmula de 0–1000 nem prioridade alta/média/baixa**: o documento de acompanhamento cita os fatores e prazos, mas não fornece pesos suficientes para calcular uma nota reproduzível. Os relatórios refletem apenas dados que existem.

A regra de pagamento foi implementada como “vencimento da última parcela OU pagamento da última parcela”, conforme o documento de regras. Isso pode liberar oportunidade mesmo com parcelas anteriores em aberto; se não for desejado, é necessário aprovar uma regra mais restritiva.

## 6. Segurança

- JWT para autenticação; senha armazenada com bcrypt.
- Validação de entrada com Zod, consultas parametrizadas, Helmet, CORS e rate limit.
- Nunca versionar `.env` ou publicar a `DATABASE_URL`.
