# ViAgenda — Front-end

Interface web do **ViAgenda**, sistema de apoio à prospecção comercial pós-venda desenvolvido para a **AGT Viagens**.

🔗 **Aplicação em Produção:** [vi-agenda.vercel.app](https://vi-agenda.vercel.app)

Construído com **React**, **TypeScript**, **Vite** e estilizado com **Tailwind CSS v4**, o front-end oferece aos vendedores e administradores um painel intuitivo e ágil para acompanhar oportunidades de retorno pós-viagem, quitação de parcelas e histórico de contatos com clientes.

---

## 🛠️ Tecnologias e Bibliotecas

- **[React 19](https://react.dev/)**: Biblioteca para interfaces declarativas e baseadas em componentes.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática para maior segurança e produtividade.
- **[Vite 8](https://vite.dev/)**: Bundler ultrarrápido para desenvolvimento e build.
- **[Tailwind CSS](https://tailwindcss.com/)** (`@tailwindcss/vite`): Estilização utilitária de alta performance.
- **[React Router DOM](https://reactrouter.com/)**: Roteamento client-side com rotas protegidas.
- **[Lucide React](https://lucide.dev/)**: Conjunto moderno e consistente de ícones.

---

## 📁 Estrutura de Diretórios

```text
frontend/
├── public/                 # Recursos estáticos (ex: favicon.svg)
├── src/
│   ├── components/         # Componentes compartilhados
│   │   ├── auth/           # Componentes de autenticação (ex: ProtectedRoute)
│   │   └── layout/         # Estrutura base da interface (Header, Sidebar, AppLayout)
│   ├── contexts/           # Contextos globais React (AuthContext, useAuth)
│   ├── pages/              # Telas e rotas da aplicação
│   │   ├── Login/          # Autenticação de usuários
│   │   ├── Dashboard/      # Painel geral com métricas, alertas e resumos
│   │   ├── Oportunidades/  # Gestão e acompanhamento de prospecções
│   │   ├── Clientes/       # Listagem e busca de clientes
│   │   ├── ClienteDetalhes/# Ficha completa do cliente, histórico e contatos
│   │   └── Relatorios/     # Indicadores e relatórios por período
│   ├── services/           # Integração com a API REST (api.ts)
│   ├── theme/              # Definições de tema e cores
│   ├── utils/              # Funções utilitárias e formatadores (datas, moeda, etc.)
│   ├── App.tsx             # Definição e proteção das rotas
│   ├── index.css           # Estilos globais e import do Tailwind
│   └── main.tsx            # Ponto de entrada da aplicação React
├── eslint.config.js        # Configurações de linting
├── package.json            # Dependências e scripts do projeto
├── tsconfig.json           # Configurações do compilador TypeScript
├── vercel.json             # Regras de rewrite SPA para deploy na Vercel
└── vite.config.ts          # Configuração do Vite e plugins
```

---

## ⚙️ Pré-requisitos

- **Node.js** (versão 18 ou superior recomendada)
- **npm** (ou yarn / pnpm)
- Instância do **Back-end do ViAgenda** em execução (por padrão em `http://localhost:3001`)

---

## 🚀 Instalação e Execução

### 1. Instalar as dependências

No diretório `frontend`:

```bash
npm install
```

### 2. Configurar variáveis de ambiente (opcional)

Por padrão, a aplicação se conecta à API em `http://localhost:3001/api`. Se precisar apontar para outro endereço, crie um arquivo `.env` na raiz da pasta `frontend`:

```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173` (ou na porta informada pelo Vite no terminal).

---

## 📜 Scripts Disponíveis

| Script | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor local de desenvolvimento com Hot Module Replacement (HMR). |
| `npm run build` | Valida a tipagem com `tsc -b` e compila o código para produção na pasta `dist`. |
| `npm run preview` | Executa um servidor local para visualizar a build de produção. |
| `npm run lint` | Executa o ESLint para verificar padrões e qualidade do código. |

---

## 🔐 Autenticação e Rotas

A aplicação utiliza autenticação baseada em **Bearer Token (JWT)**:

1. **Login (`/login`)**: O usuário insere credenciais; o token retornado é armazenado no `localStorage` sob a chave `@viagenda:token`.
2. **Rotas Protegidas (`ProtectedRoute`)**: As rotas internas (`/dashboard`, `/oportunidades`, `/clientes`, `/clientes/:id` e `/relatorios`) exigem token válido. Tentativas de acesso sem autenticação são redirecionadas para `/login`.
3. **Comunicação com a API**: A camada `api.ts` injeta automaticamente o cabeçalho `Authorization: Bearer <token>` em todas as requisições autenticadas.

---

## 🌐 Deploy

A aplicação está hospedada e em produção na Vercel:
👉 **[https://vi-agenda.vercel.app](https://vi-agenda.vercel.app)**

O projeto já contém o arquivo `vercel.json` configurado para redirecionar todas as rotas para o `index.html`, garantindo o funcionamento correto do roteamento SPA (Single Page Application):

