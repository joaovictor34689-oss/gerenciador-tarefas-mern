import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

export default function ConfirmDelete({ task, busy, error, onCancel, onConfirm }) {
  const dialog = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      aria-labelledby="delete-title"
    >
      <span className="delete-icon">
        <Trash2 size={23} />
      </span>
      <h2 id="delete-title">Excluir tarefa?</h2>
      <p>“{task.title}” será excluída permanentemente. Essa ação não pode ser desfeita.</p>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      <div className="form-actions">
        <button className="button secondary" disabled={busy} onClick={onCancel}>
          Cancelar
        </button>
        <button className="danger" disabled={busy} onClick={onConfirm}>
          {busy ? 'Excluindo…' : 'Excluir tarefa'}
        </button>
      </div>
    </dialog>
  );
}
