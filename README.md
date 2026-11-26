# Gerenciador de Tarefas MERN

Aplicação acadêmica desenvolvida com MongoDB, Express, React e Node.js. O projeto permite que usuários criem conta, façam login e gerenciem suas próprias tarefas.

## Estrutura

- backend/: API REST, autenticação JWT e acesso ao MongoDB.
- frontend/: interface React, a ser integrada na próxima etapa.

## Requisitos

- Node.js LTS e npm.
- Uma conta e um banco MongoDB Atlas.

## Iniciar o back-end

1. Abra o terminal na pasta backend.
2. Instale as dependências com npm install.
3. Copie .env.example para um arquivo chamado .env e preencha os valores localmente.
4. Inicie com npm run dev.
5. Verifique GET http://localhost:5000/api/health.

Consulte backend/README.md para configuração, rotas e testes manuais. Nunca envie o arquivo .env ao GitHub.

## Trabalho da dupla

O back-end implementa cadastro/login, proteção JWT e CRUD de tarefas. O front-end React será integrado em outra etapa. Os dois integrantes devem contribuir com commits e revisar a integração.
