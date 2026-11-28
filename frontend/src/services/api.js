const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'tarefas.token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  const token = getToken();
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error(
      'Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.',
      { cause: error }
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('O servidor retornou uma resposta inesperada. Confira a configuração da API.');
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      saveToken(null);
      window.dispatchEvent(new Event('session-expired'));
    }
    const error = new Error(data.message || 'Não foi possível concluir a solicitação.');
    error.errors = data.errors || [];
    error.status = response.status;
    throw error;
  }

  return data;
}
