import { CalendarDays, Check, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const priorities = { high: 'Alta', medium: 'Média', low: 'Baixa' };

export default function TaskCard({ task, onToggle, onDelete, busy }) {
  const completed = task.status === 'completed';
  const date = task.dueDate?.slice(0, 10);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const overdue = date && date < todayKey && !completed;

  return (
    <article className={`task-card ${completed ? 'completed' : ''}`}>
      <button
        className={`task-check ${completed ? 'checked' : ''}`}
        disabled={busy}
        onClick={() => onToggle(task)}
        aria-label={`${completed ? 'Reabrir' : 'Concluir'} tarefa: ${task.title}`}
      >
        {completed && <Check size={16} />}
      </button>
      <div className="task-body">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta">
          <span className={`priority ${task.priority}`}>
            <span />
            {priorities[task.priority]}
          </span>
          <span className={`status-tag ${completed ? 'done' : ''}`}>
            {completed ? 'Concluída' : 'Pendente'}
          </span>
          {date && (
            <span className={overdue ? 'due overdue' : 'due'}>
              <CalendarDays size={13} />
              {new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'short',
                timeZone: 'UTC'
              }).format(new Date(task.dueDate))}
              {overdue && ' · Atrasada'}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <Link
          className="icon-button"
          to={`/tarefas/${task._id}/editar`}
          aria-label={`Editar tarefa: ${task.title}`}
        >
          <Pencil size={16} />
        </Link>
        <button
          className="icon-button danger-text"
          disabled={busy}
          onClick={() => onDelete(task)}
          aria-label={`Excluir tarefa: ${task.title}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
