import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { authenticate } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';
import auth from './modules/auth/auth';
import clientes from './modules/clientes/clientes';
import destinos from './modules/destinos/destinos';
import vendas from './modules/vendas/vendas';
import pagamentos from './modules/pagamentos/pagamentos';
import interesses from './modules/interesses/interesses';
import oportunidades from './modules/oportunidades/oportunidades';
import contatos from './modules/contatos/contatos';
import dashboard from './modules/dashboard/dashboard';
import relatorios from './modules/relatorios/relatorios';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((x) => x.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (_req, res) =>
  res.json({
    status: 'ok',
    service: 'ViAgenda API',
    timestamp: new Date().toISOString(),
  })
);

const docs = {
  openapi: '3.0.0',
  info: { title: 'ViAgenda API', version: '1.0.0' },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(docs));
app.use('/api/auth', auth);
app.use('/api/clientes', authenticate, clientes);
app.use('/api/destinos', authenticate, destinos);
app.use('/api/vendas', authenticate, vendas);
app.use('/api/pagamentos', authenticate, pagamentos);
app.use('/api/interesses', authenticate, interesses);
app.use('/api/oportunidades', authenticate, oportunidades);
app.use('/api/contatos', authenticate, contatos);
app.use('/api/dashboard', authenticate, dashboard);
app.use('/api/relatorios', authenticate, relatorios);

app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
app.use(errorHandler);

export default app;
