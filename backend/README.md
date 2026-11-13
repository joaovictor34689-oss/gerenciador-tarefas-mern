# Back-end

API REST em Node.js, Express e MongoDB/Mongoose. Cadastro e login usam bcrypt para hash de senha e JWT com validade de duas horas. Todas as rotas de tarefas exigem token e filtram registros pelo usuário autenticado.

## Configurar

1. Instale Node.js LTS (versão 20 ou superior).
2. Entre nesta pasta e execute npm install.
3. Copie .env.example para .env.
4. Preencha PORT, MONGODB_URI, JWT_SECRET e CLIENT_ORIGIN. Use a URI do usuário de banco criado no MongoDB Atlas. Gere um JWT secret localmente. Nunca publique o arquivo .env.
5. Execute npm run check para verificar sintaxe e npm run dev para iniciar em desenvolvimento.
6. GET http://localhost:5000/api/health deve responder { "status": "ok" }.

O serviço só inicia quando consegue conectar ao MongoDB. Se a conexão falhar, confira a URI, a senha do usuário de banco e o IP autorizado em Network Access no Atlas.

## Rotas

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | /api/health | Público | Estado da API |
| POST | /api/auth/register | Público | Cria usuário e retorna token |
| POST | /api/auth/login | Público | Confere credenciais e retorna token |
| GET | /api/auth/me | Token | Retorna perfil público do usuário atual |
| GET | /api/tasks | Token | Lista tarefas do usuário atual |
| POST | /api/tasks | Token | Cria tarefa para o usuário atual |
| GET | /api/tasks/:id | Token | Busca tarefa própria |
| PUT | /api/tasks/:id | Token | Atualiza campos permitidos de tarefa própria |
| DELETE | /api/tasks/:id | Token | Exclui tarefa própria |

Use o endereço base http://localhost:5000. Envie JSON com Content-Type application/json. Nas rotas protegidas, envie Authorization: Bearer SEU_TOKEN.

## Formatos

Cadastro: { "name": "Ana", "email": "ana@example.com", "password": "SenhaTeste123!" }

Login: { "email": "ana@example.com", "password": "SenhaTeste123!" }

Criar tarefa: { "title": "Estudar", "description": "Revisar MERN", "priority": "high" }

Os valores de status são pending ou completed. Os valores de priority são low, medium ou high. A tarefa recebe status pending e prioridade medium quando não informados.

Respostas de autenticação incluem token e perfil público. O hash de senha nunca é devolvido. Erros retornam um objeto com message; erros de validação também incluem errors.

## Testes manuais

Com o servidor ligado, use Thunder Client ou Postman:

1. GET /api/health: esperado 200.
2. POST /api/auth/register com os dados de cadastro: esperado 201. Use email único.
3. POST /api/auth/login: esperado 200. Guarde token somente no cliente de teste.
4. GET /api/auth/me sem token: esperado 401; com token: esperado 200 sem hash.
5. POST /api/tasks com token e um title: esperado 201; anote _id.
6. GET /api/tasks com token: deve listar a tarefa.
7. PUT /api/tasks/ID com token e { "status": "completed" }: esperado 200.
8. DELETE /api/tasks/ID com token: esperado 200.
9. Cadastre um segundo usuário e repita GET /api/tasks: ele não deve ver tarefas da primeira conta.
10. Tente acessar o ID da primeira conta com token da segunda conta: esperado 404.

## Segurança básica

As senhas são armazenadas com bcrypt. JWT_SECRET e MONGODB_URI são variáveis locais. CORS aceita a origem configurada em CLIENT_ORIGIN. Helmet adiciona cabeçalhos de segurança. Endpoints validam dados no servidor, atualizações aceitam somente campos permitidos e consultas de tarefas sempre filtram pelo usuário do token.
