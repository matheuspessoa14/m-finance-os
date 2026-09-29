import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Cloud,
  CloudOff,
  Info,
  LoaderCircle,
  Undo2,
  X,
} from "lucide-react";

export function SyncStatus({ online, syncing }) {
  const state = !online ? "offline" : syncing ? "syncing" : "online";
  const Icon =
    state === "offline" ? CloudOff : state === "syncing" ? LoaderCircle : Cloud;
  const label =
    state === "offline"
      ? "Sem conexão"
      : state === "syncing"
        ? "Sincronizando..."
        : "Sincronizado";

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
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (actionBusy) return undefined;

    const timer = window.setTimeout(
      () => onDismiss(toast.id),
      Number(toast.duration) > 0 ? Number(toast.duration) : 3600
    );

    return () => window.clearTimeout(timer);
  }, [actionBusy, toast.duration, toast.id, onDismiss]);

  const Icon =
    toast.type === "error"
      ? AlertTriangle
      : toast.type === "info"
        ? Info
        : Check;

  const hasAction =
    Boolean(toast.actionLabel) && typeof toast.onAction === "function";

  async function handleAction() {
    if (!hasAction || actionBusy) return;

    setActionBusy(true);

    try {
      const result = await toast.onAction();

      if (result !== false) {
        onDismiss(toast.id);
        return;
      }

      setActionBusy(false);
    } catch (actionError) {
      console.error("Erro ao executar ação do aviso:", actionError);
      setActionBusy(false);
    }
  }

  return (
    <div
      className={`toast ${toast.type || "success"} ${hasAction ? "has-action" : ""}`}
      role="status"
    >
      <span className="toast-icon">
        <Icon size={16} />
      </span>

      <div className="toast-copy">
        <span>{toast.message}</span>

        {hasAction && (
          <button
            type="button"
            className="toast-action"
            onClick={handleAction}
            disabled={actionBusy}
          >
            {actionBusy ? (
              <LoaderCircle size={13} className="sync-spin" />
            ) : (
              <Undo2 size={13} />
            )}
            <span>{actionBusy ? "Desfazendo..." : toast.actionLabel}</span>
          </button>
        )}
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar aviso"
        disabled={actionBusy}
      >
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

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Excluir",
  danger = true,
  busy,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop confirm-backdrop"
      onMouseDown={busy ? undefined : onCancel}
    >
      <div
        className="confirm-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={danger ? "confirm-symbol danger" : "confirm-symbol"}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <span className="eyebrow">CONFIRMAÇÃO</span>
          <h2 id="confirm-title">{title}</h2>
          <p>{message}</p>
        </div>
        <div className="confirm-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={danger ? "danger-button" : "primary-button"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
