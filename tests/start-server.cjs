const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const { randomBytes } = require('node:crypto');
const { spawn } = require('node:child_process');
const backendRequire = createRequire(resolve(__dirname, '../backend/package.json'));
const { MongoMemoryServer } = backendRequire('mongodb-memory-server');
const mongoose = backendRequire('mongoose');
let mongo;
let server;
let frontend;
let stopping = false;

async function stop() {
  if (stopping) return;
  stopping = true;
  if (frontend) frontend.kill('SIGTERM');
  if (server) await new Promise((done) => server.close(done));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
}

async function start() {
  process.env.JWT_SECRET = randomBytes(48).toString('hex');
  process.env.CLIENT_ORIGIN = 'http://127.0.0.1:5173';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await backendRequire('./src/models/User').init();
  const app = backendRequire('./src/app');
  server = await new Promise((done, reject) => {
    const listener = app.listen(5000, '127.0.0.1', () => done(listener));
    listener.on('error', reject);
  });
  frontend = spawn(
    'pnpm',
    ['--filter', 'gerenciador-tarefas-frontend', 'dev', '--host', '127.0.0.1'],
    {
      stdio: 'inherit',
      env: { ...process.env, VITE_API_URL: '/api' }
    }
  );
  frontend.on('exit', () => stop().then(() => process.exit(0)));
}

process.on('SIGINT', () => stop().then(() => process.exit(0)));
process.on('SIGTERM', () => stop().then(() => process.exit(0)));
start().catch(async (error) => {
  console.error(error.message);
  await stop();
  process.exit(1);
});
