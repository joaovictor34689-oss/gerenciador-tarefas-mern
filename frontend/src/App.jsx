import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/auth';
import AuthPage from './pages/AuthPage';
import TasksPage from './pages/TasksPage';
import TaskEditorPage from './pages/TaskEditorPage';

function ProtectedPage({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { loading, user, error, retry, logout } = useAuth();

  if (loading)
    return (
      <main className="centered" role="status">
        Carregando sua sessão…
      </main>
    );
  if (!user && error && sessionStorage.getItem('tarefas.token')) {
    return (
      <main className="centered">
        <div className="panel">
          <h1>Não foi possível recuperar sua sessão</h1>
          <p role="alert">{error}</p>
          <button onClick={retry}>Tentar novamente</button>
          <button className="button secondary" onClick={logout}>
            Voltar ao login
          </button>
        </div>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/tarefas" replace /> : <AuthPage />} />
      <Route
        path="/cadastro"
        element={user ? <Navigate to="/tarefas" replace /> : <AuthPage register />}
      />
      <Route
        path="/tarefas"
        element={
          <ProtectedPage>
            <TasksPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/tarefas/nova"
        element={
          <ProtectedPage>
            <TaskEditorPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/tarefas/:id/editar"
        element={
          <ProtectedPage>
            <TaskEditorPage />
          </ProtectedPage>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/tarefas' : '/login'} replace />} />
    </Routes>
  );
}
