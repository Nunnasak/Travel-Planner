"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AccountButton } from "./account-button";
import { PasswordField } from "./password-field";
import styles from "./account-form.module.css";

interface DeleteAccountModalProps {
  email: string;
  isDeleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: (password: string) => void;
}

export function DeleteAccountModal({
  email,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeleteAccountModalProps) {
  const titleId = useId();
  const passwordId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onCancel]);

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div className={styles.modalDialog}>
        <div className={styles.modalIconWrap}>
          <svg className={styles.modalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 id={titleId} className={styles.modalTitle}>
          Delete your account?
        </h3>
        <p className={styles.modalDesc}>
          This will permanently delete <strong>{email}</strong> and all of your
          saved travel plans. You will not be able to recover your account.
        </p>

        <form
          id={`${titleId}-form`}
          className={styles.modalField}
          onSubmit={(e) => {
            e.preventDefault();
            if (password && !isDeleting) onConfirm(password);
          }}
        >
          <PasswordField
            id={passwordId}
            label="Confirm your password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={isDeleting}
          />
        </form>

        {error && (
          <p className={styles.modalError} role="alert">
            {error}
          </p>
        )}

        <div className={styles.modalActions}>
          <AccountButton ref={cancelRef} variant="secondary" disabled={isDeleting} onClick={onCancel}>
            Cancel
          </AccountButton>
          <AccountButton
            type="submit"
            form={`${titleId}-form`}
            disabled={isDeleting || !password}
          >
            {isDeleting ? "Deleting..." : "Yes, delete account"}
          </AccountButton>
        </div>
      </div>
    </div>
  );
}