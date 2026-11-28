FROM node:24-alpine
RUN npm install -g pnpm@10.26.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN pnpm install --frozen-lockfile --prod --filter gerenciador-tarefas-backend
COPY --chown=node:node backend/src backend/src
WORKDIR /app/backend
ENV NODE_ENV=production
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
