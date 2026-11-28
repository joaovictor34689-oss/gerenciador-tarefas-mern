import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCheck, Circle, ClipboardList, Plus, Search } from 'lucide-react';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import ConfirmDelete from '../components/ConfirmDelete';
import { api } from '../services/api';
import { useAuth } from '../context/auth';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [attempt, setAttempt] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const data = await api('/tasks', { signal: controller.signal });
        setTasks(data.tasks);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [attempt]);

  async function toggle(task) {
    setBusyId(task._id);
    setError('');
    setNotice('');
    try {
      const { task: updated } = await api(`/tasks/${task._id}`, {
        method: 'PUT',
        body: { status: task.status === 'completed' ? 'pending' : 'completed' }
      });
      setTasks((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setNotice(updated.status === 'completed' ? 'Tarefa concluída.' : 'Tarefa reaberta.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    setBusyId(deleting._id);
    setDeleteError('');
    try {
      await api(`/tasks/${deleting._id}`, { method: 'DELETE' });
      setTasks((current) => current.filter((task) => task._id !== deleting._id));
      setDeleting(null);
      setNotice('Tarefa excluída.');
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setBusyId(null);
    }
  }

  const completed = tasks.filter((task) => task.status === 'completed').length;
  const pending = tasks.length - completed;
  const visible = tasks.filter(
    (task) =>
      (filter === 'all' || task.status === filter) &&
      (priority === 'all' || task.priority === priority) &&
      `${task.title} ${task.description}`
        .toLocaleLowerCase('pt-BR')
        .includes(search.toLocaleLowerCase('pt-BR'))
  );
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <Layout>
      <div className="page-heading">
        <div>
          <span className="eyebrow">UM DIA DE CADA VEZ</span>
          <h1>
            Olá, {user.name.split(' ')[0]} <span className="greeting-dot">☀</span>
          </h1>
          <p>Vamos dar espaço ao que importa hoje?</p>
        </div>
        <Link className="button" to="/tarefas/nova">
          <Plus size={19} />
          Nova tarefa
        </Link>
      </div>
      <section className="stats" aria-label="Resumo das tarefas">
        <div className="stat">
          <span className="stat-icon">
            <ClipboardList size={21} />
          </span>
          <span>
            Total de tarefas<strong>{loading ? '—' : tasks.length}</strong>
          </span>
          <ArrowUpRight className="stat-arrow" size={18} />
        </div>
        <div className="stat">
          <span className="stat-icon amber">
            <Circle size={21} />
          </span>
          <span>
            Pendentes<strong>{loading ? '—' : pending}</strong>
          </span>
        </div>
        <div className="stat">
          <span className="stat-icon green">
            <CheckCheck size={22} />
          </span>
          <span>
            Concluídas<strong>{loading ? '—' : completed}</strong>
          </span>
        </div>
      </section>
      <section className="tasks-section">
        <div className="list-heading">
          <h2>
            Minhas tarefas <span>{tasks.length}</span>
          </h2>
          <span className="list-hint">Pequenos passos, grandes conquistas.</span>
        </div>
        <div className="toolbar">
          <div className="tabs" role="group" aria-label="Filtrar por status">
            {[
              ['all', 'Todas', tasks.length],
              ['pending', 'Pendentes', pending],
              ['completed', 'Concluídas', completed]
            ].map(([value, label, count]) => (
              <button
                key={value}
                aria-pressed={filter === value}
                className={filter === value ? 'tab active' : 'tab'}
                onClick={() => setFilter(value)}
              >
                {label}
                <span>{count}</span>
              </button>
            ))}
          </div>
          <div className="list-controls">
            <label className="search">
              <Search size={16} />
              <input
                aria-label="Buscar tarefas"
                placeholder="Buscar tarefa…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select
              aria-label="Filtrar por prioridade"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="all">Prioridade</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>
        </div>
        {error && (
          <div className="alert" role="alert">
            {error}{' '}
            <button
              className="text-button"
              onClick={() => {
                setLoading(true);
                setError('');
                setAttempt((value) => value + 1);
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}
        <div className="sr-only" role="status">
          {notice}
        </div>
        {loading ? (
          <div className="empty-state" role="status">
            Carregando tarefas…
          </div>
        ) : visible.length ? (
          <div className="task-list">
            {visible.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                busy={Boolean(busyId)}
                onToggle={toggle}
                onDelete={(item) => {
                  setDeleting(item);
                  setDeleteError('');
                }}
              />
            ))}
          </div>
        ) : (
          !error && (
            <div className="empty-state">
              <span className="empty-icon">
                <ClipboardList size={28} />
              </span>
              <h3>{tasks.length ? 'Nenhuma tarefa encontrada' : 'Tudo começa com uma tarefa'}</h3>
              <p>
                {tasks.length
                  ? 'Experimente outra busca ou altere os filtros.'
                  : 'Tire seus planos da cabeça e organize seu próximo passo.'}
              </p>
              {!tasks.length && (
                <Link className="button secondary" to="/tarefas/nova">
                  <Plus size={16} />
                  Criar minha primeira tarefa
                </Link>
              )}
            </div>
          )
        )}
      </section>
      {!loading && tasks.length > 0 && (
        <section className="progress-panel">
          <span className="progress-symbol">
            <CheckCheck size={23} />
          </span>
          <div>
            <strong>Seu progresso conta.</strong>
            <p>
              {completed} de {tasks.length} tarefas concluídas. Continue no seu ritmo.
            </p>
          </div>
          <div className="progress-track">
            <div className="progress-label">
              <span>Progresso geral</span>
              <strong>{progress}%</strong>
            </div>
            <progress value={completed} max={tasks.length} aria-label="Progresso das tarefas" />
          </div>
        </section>
      )}
      {deleting && (
        <ConfirmDelete
          task={deleting}
          busy={Boolean(busyId)}
          error={deleteError}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </Layout>
  );
}
