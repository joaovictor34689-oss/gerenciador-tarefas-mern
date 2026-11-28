import { ClipboardList, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth';
import Brand from './Brand';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <p className="section-label">MEU ESPAÇO</p>
        <NavLink className="nav-item" to="/tarefas">
          <ClipboardList size={19} />
          Minhas tarefas
        </NavLink>
        <div className="sidebar-note">
          <span className="note-mark">↗</span>
          <strong>Um passo de cada vez.</strong>
          <p>Organize o que importa e abra espaço para o seu dia.</p>
        </div>
        <div className="profile">
          <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user.name}</strong>
            <small>Sua conta pessoal</small>
          </div>
          <button className="icon-button" aria-label="Sair da conta" onClick={logout}>
            <LogOut size={19} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>Seu dia, mais organizado</span>
          <span className="today">
            {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(new Date())}
          </span>
        </header>
        <main className="content">{children}</main>
        <footer>Feito para manter suas ideias em movimento.</footer>
      </div>
    </div>
  );
}
