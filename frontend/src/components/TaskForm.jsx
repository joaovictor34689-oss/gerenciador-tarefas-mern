import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function TaskForm({ task, onSave }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    values.title = values.title.trim();
    values.description = values.description.trim();
    values.dueDate = values.dueDate || null;
    if (!values.title) {
      setError('Informe um título para a tarefa.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await onSave(values);
    } catch (requestError) {
      setError(requestError.errors?.[0]?.message || requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="task-form panel">
      <div className="form-section-title">
        <h2>Detalhes da tarefa</h2>
        <p>Defina o próximo passo e deixe o restante com a organização.</p>
      </div>
      <label>
        Título <span className="required">*</span>
        <input
          name="title"
          autoFocus
          required
          maxLength={100}
          defaultValue={task?.title || ''}
          placeholder="O que precisa ser feito?"
        />
      </label>
      <label>
        Descrição
        <textarea
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={task?.description || ''}
          placeholder="Adicione detalhes, ideias ou lembretes…"
        />
        <small>Até 500 caracteres. Opcional.</small>
      </label>
      <div className="form-grid">
        <label>
          Status
          <select name="status" defaultValue={task?.status || 'pending'}>
            <option value="pending">Pendente</option>
            <option value="completed">Concluída</option>
          </select>
        </label>
        <label>
          Prioridade
          <select name="priority" defaultValue={task?.priority || 'medium'}>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </label>
      </div>
      <label>
        Data de entrega
        <input name="dueDate" type="date" defaultValue={task?.dueDate?.slice(0, 10) || ''} />
        <small>Opcional. Você pode alterar ou remover a data depois.</small>
      </label>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      <div className="form-actions">
        <Link
          className={`button secondary ${busy ? 'disabled' : ''}`}
          aria-disabled={busy}
          to="/tarefas"
        >
          Cancelar
        </Link>
        <button disabled={busy}>
          <Check size={18} />
          {busy ? 'Salvando…' : 'Salvar tarefa'}
        </button>
      </div>
    </form>
  );
}
