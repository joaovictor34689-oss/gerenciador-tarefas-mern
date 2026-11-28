const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
const app = require('../src/app');
const User = require('../src/models/User');
let mongo;
let token;
let otherToken;
let taskId;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await User.init();
});

after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

function authorized(method, path, ownToken = token) {
  return request(app)[method](path).set('Authorization', `Bearer ${ownToken}`);
}

test('API MERN integrada ao MongoDB', async (suite) => {
  await suite.test('responde health e configura cabeçalhos de segurança e CORS', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', process.env.CLIENT_ORIGIN)
      .expect(200);
    assert.equal(response.body.status, 'ok');
    assert.equal(response.headers['access-control-allow-origin'], process.env.CLIENT_ORIGIN);
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    const disallowed = await request(app)
      .get('/api/health')
      .set('Origin', 'https://origem-nao-permitida.example')
      .expect(200);
    assert.notEqual(
      disallowed.headers['access-control-allow-origin'],
      'https://origem-nao-permitida.example'
    );
  });

  await suite.test('cadastra, normaliza o e-mail e armazena apenas hash bcrypt', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Pessoa Teste', email: ' TESTE@example.com ', password: 'SenhaTeste123!' })
      .expect(201);
    token = response.body.token;
    assert.equal(response.body.user.email, 'teste@example.com');
    assert.equal(response.body.user.passwordHash, undefined);
    const stored = await User.findOne({ email: 'teste@example.com' }).select('+passwordHash');
    assert.notEqual(stored.passwordHash, 'SenhaTeste123!');
    assert.equal(await bcrypt.compare('SenhaTeste123!', stored.passwordHash), true);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(payload.exp - payload.iat, 7200);
  });

  await suite.test('rejeita e-mail duplicado', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Outra Pessoa', email: 'teste@example.com', password: 'SenhaTeste123!' })
      .expect(409);
  });

  await suite.test('valida campos sem devolver a senha em mensagens de erro', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'invalido', password: 'curta' })
      .expect(400);
    assert.ok(response.body.errors.some((error) => error.field === 'password'));
    assert.equal(JSON.stringify(response.body).includes('curta'), false);
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Teste', email: 'unicode@example.com', password: 'á'.repeat(37) })
      .expect(400);
  });

  await suite.test('rejeita objetos e arrays em campos de autenticação', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: 'SenhaTeste123!' })
      .expect(400);
    await request(app)
      .post('/api/auth/register')
      .send({ name: ['Nome'], email: ['array@example.com'], password: ['SenhaTeste123!'] })
      .expect(400);
  });

  await suite.test('autentica com senha correta e rejeita senha incorreta', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'teste@example.com', password: 'senha-errada' })
      .expect(401);
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teste@example.com', password: 'SenhaTeste123!' })
      .expect(200);
    assert.ok(response.body.token);
    assert.equal(response.body.user.passwordHash, undefined);
  });

  await suite.test('protege todas as operações e rejeita JWT expirado ou malformado', async () => {
    for (const [method, path] of [
      ['get', '/api/tasks'],
      ['post', '/api/tasks'],
      ['get', '/api/tasks/507f1f77bcf86cd799439011'],
      ['put', '/api/tasks/507f1f77bcf86cd799439011'],
      ['delete', '/api/tasks/507f1f77bcf86cd799439011'],
      ['get', '/api/auth/me']
    ]) {
      await request(app)[method](path).expect(401);
    }
    await authorized('get', '/api/tasks', 'invalido').expect(401);
    await authorized(
      'get',
      '/api/tasks',
      jwt.sign({ sub: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET, { expiresIn: -1 })
    ).expect(401);
    await authorized(
      'get',
      '/api/tasks',
      jwt.sign({ sub: { $ne: null } }, process.env.JWT_SECRET)
    ).expect(401);
  });

  await suite.test('retorna perfil sem hash', async () => {
    const response = await authorized('get', '/api/auth/me').expect(200);
    assert.equal(response.body.user.name, 'Pessoa Teste');
    assert.equal(response.body.user.passwordHash, undefined);
  });

  await suite.test(
    'cria tarefa com padrões e ignora tentativa de trocar proprietário',
    async () => {
      const response = await authorized('post', '/api/tasks')
        .send({ title: 'Estudar MERN', userId: '507f1f77bcf86cd799439011' })
        .expect(201);
      taskId = response.body.task._id;
      assert.equal(response.body.task.status, 'pending');
      assert.equal(response.body.task.priority, 'medium');
      assert.equal(response.body.task.dueDate, null);
      assert.equal(response.body.task.userId, jwt.verify(token, process.env.JWT_SECRET).sub);
    }
  );

  await suite.test('lista, consulta e preserva dados ao reconectar ao banco', async () => {
    await mongoose.disconnect();
    await mongoose.connect(mongo.getUri());
    const listed = await authorized('get', '/api/tasks').expect(200);
    assert.equal(listed.body.tasks.length, 1);
    const response = await authorized('get', `/api/tasks/${taskId}`).expect(200);
    assert.equal(response.body.task.title, 'Estudar MERN');
  });

  await suite.test('edita todos os campos e permite remover data opcional', async () => {
    const response = await authorized('put', `/api/tasks/${taskId}`)
      .send({
        title: 'Revisar React',
        description: 'Hooks e estado',
        status: 'completed',
        priority: 'high',
        dueDate: '2027-01-20'
      })
      .expect(200);
    assert.equal(response.body.task.title, 'Revisar React');
    assert.equal(response.body.task.status, 'completed');
    assert.equal(response.body.task.priority, 'high');
    assert.ok(response.body.task.dueDate.startsWith('2027-01-20'));
    const cleared = await authorized('put', `/api/tasks/${taskId}`)
      .send({ dueDate: null })
      .expect(200);
    assert.equal(cleared.body.task.dueDate, null);
    await authorized('post', '/api/tasks').send({ title: 'Sem data', dueDate: null }).expect(201);
  });

  await suite.test(
    'valida títulos, enums, data, identificadores e atualizações vazias',
    async () => {
      for (const body of [
        { title: ' ' },
        { title: 'x'.repeat(101) },
        { title: { $ne: '' } },
        { title: 'Teste', status: ['pending'] },
        { title: 'Teste', priority: 'urgent' },
        { title: 'Teste', dueDate: '2027-02-31' },
        { title: 'Teste', description: 'x'.repeat(501) }
      ]) {
        await authorized('post', '/api/tasks').send(body).expect(400);
      }
      await authorized('get', '/api/tasks/invalido').expect(400);
      await authorized('put', `/api/tasks/${taskId}`).send({}).expect(400);
      await authorized('put', `/api/tasks/${taskId}`)
        .send({ userId: '507f1f77bcf86cd799439011' })
        .expect(400);
    }
  );

  await suite.test('isola tarefas entre contas em todas as operações', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Segunda Conta', email: 'segunda@example.com', password: 'SenhaTeste123!' })
      .expect(201);
    otherToken = response.body.token;
    const list = await authorized('get', '/api/tasks', otherToken).expect(200);
    assert.deepEqual(list.body.tasks, []);
    await authorized('get', `/api/tasks/${taskId}`, otherToken).expect(404);
    await authorized('put', `/api/tasks/${taskId}`, otherToken)
      .send({ title: 'Invadida' })
      .expect(404);
    await authorized('delete', `/api/tasks/${taskId}`, otherToken).expect(404);
    const unchanged = await authorized('get', `/api/tasks/${taskId}`).expect(200);
    assert.equal(unchanged.body.task.title, 'Revisar React');
  });

  await suite.test('trata JSON inválido, payload excessivo e endereço inexistente', async () => {
    await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{')
      .expect(400);
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'x'.repeat(12000) })
      .expect(413);
    await request(app).get('/api/inexistente').expect(404);
  });

  await suite.test('exclui tarefa e confirma que não pode ser encontrada', async () => {
    await authorized('delete', `/api/tasks/${taskId}`).expect(200);
    await authorized('get', `/api/tasks/${taskId}`).expect(404);
    const response = await authorized('get', '/api/tasks').expect(200);
    assert.equal(
      response.body.tasks.some((task) => task._id === taskId),
      false
    );
  });

  await suite.test('limita tentativas de autenticação sem bloquear leitura pública', async () => {
    let status;
    for (let count = 0; count < 31; count += 1) {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalido', password: '' });
      status = response.status;
      if (status === 429) break;
    }
    assert.equal(status, 429);
    await request(app).get('/api/health').expect(200);
  });
});
