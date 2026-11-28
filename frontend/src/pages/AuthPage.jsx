import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import Brand from '../components/Brand';
import { useAuth } from '../context/auth';

export default function AuthPage({ register = false }) {
  const { authenticate, error: sessionError } = useAuth();
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setFields({});
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (register && new TextEncoder().encode(values.password).length > 72) {
      setError('A senha deve ter no máximo 72 bytes. Reduza a quantidade de caracteres.');
      return;
    }
    setBusy(true);
    try {
      await authenticate(register ? 'register' : 'login', values);
    } catch (requestError) {
      setError(requestError.message);
      setFields(
        Object.fromEntries(
          (requestError.errors || []).map(({ field, message }) => [field, message])
        )
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-story">
        <Brand />
        <div className="auth-intro">
          <span className="eyebrow">MENOS RUÍDO. MAIS FOCO.</span>
          <h1>
            Um lugar para
            <br />
            colocar o seu
            <br />
            <em>dia em ordem.</em>
          </h1>
          <p>
            Das pequenas pendências aos grandes planos.
            <br />
            Cada tarefa tem seu espaço por aqui.
          </p>
          <div className="sample-task">
            <span>
              <Check size={17} />
            </span>
            Dar o primeiro passo<strong>Hoje</strong>
          </div>
        </div>
        <small>Gerenciador de tarefas · Projeto MERN</small>
      </section>
      <main className="auth-form-area">
        <div className="auth-form">
          <span className="eyebrow">{register ? 'COMECE POR AQUI' : 'BOM TER VOCÊ DE VOLTA'}</span>
          <h2>{register ? 'Crie sua conta' : 'Entre no seu espaço'}</h2>
          <p>
            {register
              ? 'O próximo passo para uma rotina mais leve.'
              : 'Suas tarefas estão esperando por você.'}
          </p>
          <form key={register ? 'register' : 'login'} onSubmit={submit}>
            {register && (
              <label>
                Nome
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={60}
                  placeholder="Como podemos chamar você?"
                  aria-invalid={Boolean(fields.name)}
                />
                {fields.name && <small className="field-error">{fields.name}</small>}
              </label>
            )}
            <label>
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="voce@exemplo.com"
                aria-invalid={Boolean(fields.email)}
              />
              {fields.email && <small className="field-error">{fields.email}</small>}
            </label>
            <label>
              Senha
              <input
                name="password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
                required
                minLength={register ? 8 : 1}
                maxLength={72}
                placeholder={register ? 'Pelo menos 8 caracteres' : 'Sua senha'}
                aria-invalid={Boolean(fields.password)}
              />
              {fields.password && <small className="field-error">{fields.password}</small>}
            </label>
            {(error || sessionError) && (
              <div role="alert" className="alert">
                {error || sessionError}
              </div>
            )}
            <button className="full-width" disabled={busy}>
              {busy ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar'}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="auth-switch">
            {register ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
            <Link
              to={register ? '/login' : '/cadastro'}
              onClick={() => {
                setError('');
                setFields({});
              }}
            >
              {register ? 'Entrar' : 'Criar conta'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
