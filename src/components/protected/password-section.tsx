"use client";

import { useId, useState, type FormEvent } from "react";
import { AccountButton } from "./account-button";
import { PasswordField } from "./password-field";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";
import styles from "./account-form.module.css";

interface PasswordSectionProps {
  onUpdatePassword?: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void> | void;
}

/** "Password" row plus the slide-down change-password form. */
export function PasswordSection({ onUpdatePassword }: PasswordSectionProps) {
  const uid = useId();
  const panelId = `${uid}-panel`;

  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Changing the key remounts the form, which also resets each field's show/hide state.
  const [formKey, setFormKey] = useState(0);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setFormKey((key) => key + 1);
  }

  function close() {
    setIsOpen(false);
    resetForm();
  }

  function toggle() {
    if (isOpen) close();
    else setIsOpen(true);
  }

  function clearError() {
    if (error) setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSaving) return;

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setError(`New password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from the current one.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdatePassword?.({ currentPassword, newPassword });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className={styles.passwordRow}>
        <div>
          <div className={styles.rowTitle}>Change password</div>
        </div>

        <AccountButton
          variant="outline"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={toggle}
        >
          Change password
        </AccountButton>
      </div>

      <div id={panelId} className={`${styles.accordion} ${isOpen ? styles.isOpen : ""}`}>
        <div className={styles.accordionInner}>
          <div className={styles.drawerBox}>
            <form key={formKey} onSubmit={handleSubmit} noValidate className={styles.passwordForm}>
              <PasswordField
                id={`${uid}-current`}
                label="Current password"
                value={currentPassword}
                onChange={(value) => {
                  setCurrentPassword(value);
                  clearError();
                }}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isSaving}
              />
              <PasswordField
                id={`${uid}-new`}
                label="New password"
                value={newPassword}
                onChange={(value) => {
                  setNewPassword(value);
                  clearError();
                }}
                autoComplete="new-password"
                placeholder={`Minimum ${PASSWORD_MIN_LENGTH} characters`}
                disabled={isSaving}
              />
              <PasswordField
                id={`${uid}-confirm`}
                label="Confirm new password"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  clearError();
                }}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                disabled={isSaving}
              />

              {error && (
                <p className={styles.passwordError} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.passwordActions}>
                <AccountButton variant="secondary" onClick={close} disabled={isSaving}>
                  Cancel
                </AccountButton>
                <AccountButton type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save password"}
                </AccountButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
