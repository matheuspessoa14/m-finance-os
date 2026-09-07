import { useEffect } from "react";
import { AlertTriangle, Check, Cloud, CloudOff, Info, LoaderCircle, X } from "lucide-react";


export function SyncStatus({ online, syncing }) {
  const state = !online ? "offline" : syncing ? "syncing" : "online";
  const Icon = state === "offline" ? CloudOff : state === "syncing" ? LoaderCircle : Cloud;
  const label = state === "offline" ? "Sem conexão" : state === "syncing" ? "Sincronizando..." : "Sincronizado";

  return (
    <div className={`sync-status ${state}`} aria-live="polite" title={label}>
      <Icon size={14} className={state === "syncing" ? "sync-spin" : ""} />
      <span>{label}</span>
    </div>
  );
}

export function OfflineBanner({ online }) {
  if (online) return null;

  return (
    <div className="offline-banner" role="status">
      <CloudOff size={16} />
      <span>
        Você está sem internet. Seus dados já carregados continuam visíveis,
        mas novos lançamentos precisam de conexão.
      </span>
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 3600);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon = toast.type === "error" ? AlertTriangle : toast.type === "info" ? Info : Check;

  return (
    <div className={`toast ${toast.type || "success"}`} role="status">
      <span className="toast-icon"><Icon size={16} /></span>
      <span>{toast.message}</span>
      <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Fechar aviso">
        <X size={15} />
      </button>
    </div>
  );
}

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Excluir", danger = true, busy, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop confirm-backdrop" onMouseDown={busy ? undefined : onCancel}>
      <div className="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className={danger ? "confirm-symbol danger" : "confirm-symbol"}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <span className="eyebrow">CONFIRMAÇÃO</span>
          <h2 id="confirm-title">{title}</h2>
          <p>{message}</p>
        </div>
        <div className="confirm-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className={danger ? "danger-button" : "primary-button"} onClick={onConfirm} disabled={busy}>
            {busy ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
