"use client";
import { useId, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ title, message, confirmLabel, busy, onConfirm, onCancel }: Props) {
  const id = useId();

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  }

  return createPortal(
    <div
      className="modal-backdrop confirm-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onCancel()}
      onKeyDown={onKey}
    >
      <div
        className="modal confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-message`}
      >
        <h2 id={`${id}-title`}>{title}</h2>
        <p id={`${id}-message`}>{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn-outline" autoFocus onClick={onCancel} disabled={busy}>
            ยกเลิก
          </button>
          <button type="button" className="btn-coral" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
