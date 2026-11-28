# Em dia · Gerenciador de Tarefas MERN

Aplicação acadêmica para organizar tarefas pessoais com cadastro, login, prioridades, prazos e acompanhamento de progresso. Cada conta acessa somente suas próprias tarefas.

## Integrantes

| Integrante  | GitHub                                                        | Contribuição                                                             |
| ----------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| João Victor | [joaovictor34689-oss](https://github.com/joaovictor34689-oss) | API Express, modelos Mongoose, autenticação e CRUD inicial               |
| Pedro Renan | [Pedro-Renan](https://github.com/Pedro-Renan)                 | Interface React, integração, correções, testes e documentação de entrega |

## Tecnologias e organização

React 19, React Router, Vite, CSS e Lucide no front-end; Node.js, Express, Mongoose, MongoDB, bcrypt e JWT no back-end. O projeto usa um workspace pnpm e um arquivo de lock para reproduzir as instalações.

```text
backend/
  src/config/          conexão com MongoDB
  src/controllers/     autenticação e operações de tarefas
  src/middlewares/     JWT, validação e tratamento de erros
  src/models/          User e Task
  src/routes/          rotas públicas e protegidas
  test/                testes de integração com MongoDB temporário
frontend/
  src/components/      layout, cartões, formulário e confirmação
  src/context/         sessão de autenticação
  src/pages/           login/cadastro, tarefas e criação/edição
  src/services/        cliente HTTP e armazenamento da sessão
tests/e2e/             testes reais de navegador
docker-compose.yml     MongoDB, API e interface com Nginx
```

## Executar localmente

Requisitos: Node.js **22.12 ou superior**, pnpm **10.26.1** e MongoDB Atlas ou MongoDB local. Instale o pnpm, se necessário, com `npm install -g pnpm@10.26.1`.

```bash
git clone https://github.com/joaovictor34689-oss/gerenciador-tarefas-mern.git
cd gerenciador-tarefas-mern
pnpm install --frozen-lockfile
```

Copie `backend/.env.example` para `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

No PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Preencha localmente:

| Variável        | Configuração                                                              |
| --------------- | ------------------------------------------------------------------------- |
| `PORT`          | `5000`                                                                    |
| `MONGODB_URI`   | URI do seu banco Atlas ou `mongodb://127.0.0.1:27017/gerenciador_tarefas` |
| `JWT_SECRET`    | Segredo aleatório de pelo menos 32 caracteres                             |
| `CLIENT_ORIGIN` | `http://localhost:5173`                                                   |

Gere o segredo no seu terminal com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` e copie o resultado apenas para o arquivo local. Nunca publique `.env`, URI do Atlas, senhas ou tokens.

No Atlas, crie um usuário de banco com acesso à base e autorize o IP da máquina em Network Access. Não é necessário usar Atlas ao executar com MongoDB local ou Docker.

Inicie as duas aplicações, **na raiz**:

```bash
pnpm dev
```

Abra **http://localhost:5173**. A API atende em **http://localhost:5000/api**. O Vite encaminha `/api` para o back-end; não é necessário criar um `.env` no front para esse fluxo.

Também é possível iniciar em terminais separados:

```bash
pnpm --filter gerenciador-tarefas-backend dev
pnpm --filter gerenciador-tarefas-frontend dev
```

O arquivo opcional `frontend/.env` pode definir `VITE_API_URL` se a API estiver em outro endereço. Use um endereço terminado em `/api` e reinicie o Vite após alterá-lo. Essa variável é pública no bundle; nunca coloque segredos em variáveis `VITE_*`.

O back-end só escuta a porta depois de conectar ao MongoDB. `GET /api/health` deve retornar `{"status":"ok"}`.

## Telas e funcionalidades

- `/cadastro`: cria conta, valida nome/e-mail/senha e abre as tarefas.
- `/login`: autentica, mostra erros de credenciais e recupera uma sessão existente.
- `/tarefas`: lista, busca, filtra por status/prioridade e mostra totais e progresso.
- `/tarefas/nova`: cria tarefa com título, descrição, prioridade, status e data opcional.
- `/tarefas/:id/editar`: recupera e altera uma tarefa, inclusive removendo a data.
- Conclusão/reabertura diretamente no cartão, confirmação antes de excluir e logout.
- Layout responsivo e estados de carregamento, erro, sessão expirada e lista vazia.

O JWT fica em `sessionStorage`, separado por aba e removido ao sair. Páginas privadas exigem sessão, mas a autorização efetiva sempre ocorre na API. Tokens expiram em duas horas. Para produção, considere sessões em cookies HttpOnly/Secure, HTTPS e armazenamento compartilhado do limitador de autenticação.

## API

Envie JSON nas operações de escrita e `Authorization: Bearer <token>` nas rotas privadas.

| Método | Rota                 | Acesso  | Resultado                         |
| ------ | -------------------- | ------- | --------------------------------- |
| GET    | `/api/health`        | Público | Estado do servidor                |
| POST   | `/api/auth/register` | Público | Cria conta e retorna token/perfil |
| POST   | `/api/auth/login`    | Público | Autentica e retorna token/perfil  |
| GET    | `/api/auth/me`       | Privado | Perfil sem hash de senha          |
| GET    | `/api/tasks`         | Privado | Lista tarefas próprias            |
| POST   | `/api/tasks`         | Privado | Cria tarefa                       |
| GET    | `/api/tasks/:id`     | Privado | Recupera tarefa própria           |
| PUT    | `/api/tasks/:id`     | Privado | Atualiza campos permitidos        |
| DELETE | `/api/tasks/:id`     | Privado | Exclui tarefa própria             |

Cadastro: `name` de 2 a 60 caracteres, `email` válido e `password` com ao menos 8 caracteres e no máximo 72 bytes UTF-8 (limite do bcrypt). O e-mail é normalizado para minúsculas.

Tarefa: `title` obrigatório de até 100 caracteres; `description` de até 500; `status` é `pending` ou `completed`; `priority` é `low`, `medium` ou `high`; `dueDate` aceita data ISO 8601 ou `null`. Padrões: pendente, média e sem data. O cliente não escolhe `userId`.

Erros retornam `message`; validações incluem `errors` com `field` e `message`, sem repetir dados sensíveis. Códigos principais: 400 (dados inválidos), 401 (não autenticado), 404 (não encontrado/sem acesso), 409 (e-mail duplicado), 413 (JSON maior que 10 KB), 429 (limite de autenticação) e 500 (falha interna).

## Verificações automatizadas

Na raiz:

```bash
pnpm check
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit --prod
```

`pnpm check` executa ESLint, sintaxe do back-end e build de produção do React. `pnpm test` inicia um processo real de MongoDB temporário com `mongodb-memory-server`: não utiliza Atlas nem mocks de persistência. A primeira execução precisa de internet para baixar o binário MongoDB compatível com o sistema.

Os testes de API cobrem cadastro, hash bcrypt, JWT, login, CRUD, persistência após reconexão, isolamento entre contas, tentativa de injeção, validações, JSON inválido, limite de payload e limite de autenticação. Os testes Playwright sobem API, MongoDB e Vite isolados nas portas 5000/5173; pare sua aplicação local antes de executá-los. Eles cobrem o fluxo completo no Chromium, edição/remoção de data, busca/filtros, confirmação de exclusão, sessão inválida, conteúdo HTML tratado como texto, tela móvel e recuperação de falha de rede.

Em Linux, o Playwright pode exigir bibliotecas do sistema (`pnpm exec playwright install --with-deps chromium`). Em ambientes com Chromium já instalado, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` com o caminho do executável.

## Executar com Docker

Requisitos: Docker Engine/Desktop e Docker Compose. Não é necessário instalar Node ou configurar Atlas.

1. Copie `.env.example` da **raiz** para `.env` (`cp .env.example .env`, ou `Copy-Item .env.example .env` no PowerShell).
2. Gere um segredo aleatório de pelo menos 32 caracteres, com seu gerenciador de senhas ou o comando Node mostrado acima se disponível, e preencha `JWT_SECRET`.
3. Execute:

```bash
docker compose up --build -d
docker compose ps
```

Abra **http://localhost:8080**. O Nginx serve o React e encaminha `/api` para o Express. MongoDB e API ficam somente na rede interna do Compose; o volume `mongo-data` preserva usuários e tarefas entre reinícios. Rotas React funcionam também ao recarregar a página.

```bash
docker compose logs backend
docker compose down
```

`docker compose down` mantém os dados. **Não use `docker compose down -v` a menos que queira apagar todos os usuários e tarefas do ambiente Docker.** O MongoDB desse ambiente de desenvolvimento não usa senha e não publica porta no computador; não exponha esse serviço diretamente à internet.

## Roteiro de conferência da entrega

1. Clone em uma pasta nova, instale com o lockfile e configure o ambiente.
2. Crie uma conta, saia e entre novamente. Tente uma senha incorreta.
3. Crie tarefa, recarregue a página, edite título/prioridade/data, conclua e reabra.
4. Busque e filtre tarefas; remova uma data e confirme que a tarefa continua salva.
5. Abra a exclusão, cancele e depois confirme. Confira que a tarefa sumiu.
6. Crie outra conta em outro contexto de navegador e confirme o isolamento.
7. Execute as verificações automatizadas e leia os resultados.
8. Revise o PR em dupla antes de mesclar. Ambos devem conferir seus commits e enviar o link do repositório no AVA dentro do prazo.

## Segurança aplicada e limites

Senhas com bcrypt; assinatura JWT HS256 e expiração; segredo validado na inicialização; CORS configurável; Helmet; limite de corpo JSON; limite de 30 tentativas malsucedidas de autenticação a cada 15 minutos por IP; validação de tipos e tamanho; consultas e alterações vinculadas ao usuário autenticado; atualizações com lista de campos permitidos. React renderiza conteúdo de tarefas como texto, sem HTML bruto.

O limitador usa memória do processo: reiniciar a API zera a contagem e múltiplas instâncias não compartilham limites. A sessão em `sessionStorage` é adequada à demonstração, mas continua acessível a JavaScript. Não há recuperação de senha nem verificação de e-mail. Docker é uma opção local de execução, não uma configuração pronta de produção.
