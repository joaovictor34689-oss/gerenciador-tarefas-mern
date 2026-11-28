const { test, expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');

async function register(page, name) {
  const email = `teste-${randomUUID()}@example.com`;
  await page.goto('/cadastro');
  await page.getByLabel('Nome', { exact: true }).fill(name);
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('SenhaTeste123!');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page).toHaveURL('/tarefas');
  return email;
}

test('cadastro, sessão, CRUD, filtros, isolamento e logout no navegador', async ({
  page,
  browser
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/tarefas/nova');
  await expect(page).toHaveURL('/login');
  const email = await register(page, 'Pedro Teste');
  await expect(page.getByText('Tudo começa com uma tarefa')).toBeVisible();
  await page.getByRole('link', { name: 'Nova tarefa', exact: true }).click();
  await page.getByLabel('Título').fill('Revisar integração MERN');
  await page.getByLabel('Descrição').fill('Validar cadastro, login e CRUD.');
  await page.getByRole('combobox', { name: 'Prioridade', exact: true }).selectOption('high');
  await page.getByLabel('Data de entrega').fill('2027-01-20');
  await page.getByRole('button', { name: 'Salvar tarefa' }).click();
  await expect(page.getByRole('heading', { name: 'Revisar integração MERN' })).toBeVisible();
  const firstTaskId = await page
    .getByRole('link', { name: 'Editar tarefa: Revisar integração MERN' })
    .getAttribute('href');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Revisar integração MERN' })).toBeVisible();
  await page.getByRole('link', { name: 'Editar tarefa: Revisar integração MERN' }).click();
  await page.getByLabel('Título').fill('Entregar trabalho');
  await page.getByLabel('Descrição').fill('<img src=x onerror=alert(1)>');
  await page.getByLabel('Data de entrega').fill('');
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('completed');
  await page.getByRole('button', { name: 'Salvar tarefa' }).click();
  await expect(page.getByRole('heading', { name: 'Entregar trabalho' })).toBeVisible();
  await expect(page.locator('.due')).toHaveCount(0);
  await expect(page.getByText('<img src=x onerror=alert(1)>', { exact: true })).toBeVisible();
  await expect(page.locator('.task-body img')).toHaveCount(0);
  await page.getByRole('button', { name: /^Pendentes/ }).click();
  await expect(page.getByText('Nenhuma tarefa encontrada')).toBeVisible();
  await page.getByRole('button', { name: /^Concluídas/ }).click();
  await expect(page.getByRole('heading', { name: 'Entregar trabalho' })).toBeVisible();
  await page.getByLabel('Buscar tarefas').fill('inexistente');
  await expect(page.getByText('Nenhuma tarefa encontrada')).toBeVisible();
  await page.getByLabel('Buscar tarefas').fill('');
  await page.getByLabel('Filtrar por prioridade').selectOption('low');
  await expect(page.getByText('Nenhuma tarefa encontrada')).toBeVisible();
  await page.getByLabel('Filtrar por prioridade').selectOption('high');
  await page.getByRole('button', { name: 'Reabrir tarefa: Entregar trabalho' }).click();
  await expect(page.getByText('Nenhuma tarefa encontrada')).toBeVisible();
  await page.getByRole('button', { name: /^Todas/ }).click();
  await expect(page.getByRole('heading', { name: 'Entregar trabalho' })).toBeVisible();
  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  try {
    await register(otherPage, 'Segunda Conta');
    await expect(otherPage.getByText('Tudo começa com uma tarefa')).toBeVisible();
    await otherPage.goto(firstTaskId);
    await expect(otherPage.getByRole('alert')).toContainText('Tarefa não encontrada');
  } finally {
    await otherContext.close();
  }
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('senha-incorreta');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('E-mail ou senha incorretos.');
  await page.getByLabel('Senha', { exact: true }).fill('SenhaTeste123!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/tarefas');
  await page.getByRole('button', { name: 'Excluir tarefa: Entregar trabalho' }).click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Entregar trabalho' })).toBeVisible();
  await page.getByRole('button', { name: 'Excluir tarefa: Entregar trabalho' }).click();
  await page.getByRole('button', { name: 'Excluir tarefa', exact: true }).click();
  await expect(page.getByText('Tudo começa com uma tarefa')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Tudo começa com uma tarefa')).toBeVisible();
  await page.evaluate(() => sessionStorage.setItem('tarefas.token', 'token-invalido'));
  await page.reload();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('alert')).toContainText('Sua sessão expirou');
  expect(errors).toEqual([]);
});

test('interface móvel sem rolagem horizontal e erros de rede recuperáveis', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await register(page, 'Conta Mobile');
  await expect(page.getByRole('heading', { name: /Olá, Conta/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.getByRole('link', { name: 'Nova tarefa', exact: true }).click();
  await page.getByLabel('Título').fill('   ');
  await page.getByRole('button', { name: 'Salvar tarefa' }).click();
  await expect(page.getByRole('alert')).toContainText('Informe um título');
  await page.getByLabel('Título').fill('Testar em tela pequena');
  await page.route('**/api/tasks', (route) => route.abort());
  await page.getByRole('button', { name: 'Salvar tarefa' }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível acessar');
  await page.unroute('**/api/tasks');
  await page.getByRole('button', { name: 'Salvar tarefa' }).click();
  await expect(page.getByRole('heading', { name: 'Testar em tela pequena' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});
