"use client";

import { useId, useState } from "react";
import { AccountButton } from "./account-button";
import { DeleteAccountModal } from "./delete-account-modal";
import styles from "./account-form.module.css";

interface DangerZoneProps {
  email: string;
  onDeleteAccount?: (password: string) => Promise<void> | void;
}

/** "Delete account" card. Owns the confirmation modal's state. */
export function DangerZone({ email, onDeleteAccount }: DangerZoneProps) {
  const headingId = useId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    setError("");
    setIsModalOpen(true);
  }

  async function confirmDelete(password: string) {
    if (isDeleting) return;

    setIsDeleting(true);
    setError("");
    try {
      await onDeleteAccount?.(password);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบบัญชีไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section aria-labelledby={headingId} className={`${styles.card} ${styles.cardDanger}`}>
      <div>
        <h2 id={headingId} className={styles.dangerTitle}>
          ลบบัญชี
        </h2>
        <p className={styles.dangerDesc}>
          ลบบัญชีและแผนเที่ยวทั้งหมดของคุณถาวร กู้คืนไม่ได้
        </p>
      </div>

      <AccountButton variant="danger" size="lg" onClick={openModal}>
        ลบบัญชี
      </AccountButton>

      {isModalOpen && (
        <DeleteAccountModal
          email={email}
          isDeleting={isDeleting}
          error={error}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}
