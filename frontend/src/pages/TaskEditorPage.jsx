import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import TaskForm from '../components/TaskForm';
import { api } from '../services/api';

export default function TaskEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await api(`/tasks/${id}`, { signal: controller.signal });
        setTask(data.task);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoadedId(id);
      }
    }
    load();
    return () => controller.abort();
  }, [id, attempt]);

  async function save(values) {
    await api(id ? `/tasks/${id}` : '/tasks', { method: id ? 'PUT' : 'POST', body: values });
    navigate('/tarefas');
  }

  return (
    <Layout>
      <Link className="back-link" to="/tarefas">
        <ArrowLeft size={17} />
        Voltar às tarefas
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CADA PASSO IMPORTA</span>
          <h1>{id ? 'Editar tarefa' : 'Nova tarefa'}</h1>
          <p>{id ? 'Ajuste os detalhes e siga em frente.' : 'Dê um lugar ao seu próximo plano.'}</p>
        </div>
      </div>
      {id && loadedId !== id ? (
        <p role="status">Carregando tarefa…</p>
      ) : error ? (
        <div className="alert" role="alert">
          {error}{' '}
          <button
            className="text-button"
            onClick={() => {
              setError('');
              setLoadedId(null);
              setAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <TaskForm key={id || 'new'} task={id ? task : null} onSave={save} />
      )}
    </Layout>
  );
}
