"use client";

import { useState, type KeyboardEvent } from "react";
import { UserIcon } from "@/components/ui/icon";
import { AccountButton } from "./account-button";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "@/lib/validation";
import styles from "./account-form.module.css";

interface ProfileSectionProps {
  initialUsername: string;
  email: string;
  id: number;
  onSaveUsername?: (newUsername: string) => Promise<void> | void;
}

/** Avatar, username + email, and the inline "Change username" editor. */
export function ProfileSection({
  initialUsername,
  email,
  id,
  onSaveUsername,
}: ProfileSectionProps) {
  const [username, setUsername] = useState(initialUsername);
  const [draft, setDraft] = useState(initialUsername);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function startEditing() {
    setDraft(username);
    setError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(username);
    setError("");
    setIsEditing(false);
  }

  async function save() {
    if (isSaving) return;

    const trimmed = draft.trim();
    if (trimmed.length < USERNAME_MIN_LENGTH || trimmed.length > USERNAME_MAX_LENGTH) {
      setError(`Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters.`);
      return;
    }
    if (trimmed === username) {
      cancelEditing(); // nothing changed, skip the request
      return;
    }

    setIsSaving(true);
    try {
      await onSaveUsername?.(trimmed);
      setUsername(trimmed);
      setError("");
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update username.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void save();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  }

  return (
    <div className={styles.profileRow}>
      <div className={styles.profileGroup}>
        <div className={styles.avatar} aria-hidden="true">
          <UserIcon />
        </div>

        <div className={styles.profileDetails}>
          {!isEditing ? (
            <div>
              <div className={styles.username}>{username} <span className={styles.id}>#{String(id).padStart(6, '0')}</span></div>
              <div className={styles.profileMeta}>
                <span className={styles.email}>{email}</span>
              </div>
            </div>
          ) : (
            <div className={styles.reveal}>
              <label htmlFor="account-username-input" className={styles.editLabel}>
                Username
              </label>
              <div className={styles.editControls}>
                <input
                  type="text"
                  id="account-username-input"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={isSaving}
                  className={styles.editInput}
                  autoFocus
                />
                <AccountButton size="sm" onClick={save} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </AccountButton>
                <AccountButton variant="secondary" size="sm" onClick={cancelEditing} disabled={isSaving}>
                  Cancel
                </AccountButton>
              </div>
              {error && (
                <p className={styles.profileError} role="alert">
                  {error}
                </p>
              )}
              <div className={`${styles.email} ${styles.emailEdit}`}>{email}</div>
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <AccountButton variant="outline" onClick={startEditing}>
          Change username
        </AccountButton>
      )}
    </div>
  );
}
