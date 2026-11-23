"use client";

import { useState } from "react";
import { AccountButton } from "./account-button";
import styles from "./account-form.module.css";

interface LogoutAllSectionProps {
  onLogoutAll?: () => Promise<void> | void;
}

export function LogoutAllSection({ onLogoutAll }: LogoutAllSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      await onLogoutAll?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ออกจากระบบทุกเครื่องไม่สำเร็จ ลองอีกครั้ง");
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className={styles.passwordRow}>
        <div>
          <div className={styles.rowTitle}>ออกจากระบบทุกเครื่อง</div>
          <p className={styles.rowDesc}>
            ออกจากระบบทุกเครื่องที่เคยล็อกอินไว้ รวมถึงเครื่องนี้ด้วย
          </p>
        </div>

        <AccountButton variant="outline" onClick={handleClick} disabled={isLoading}>
          {isLoading ? "กำลังออกจากระบบ..." : "ออกจากระบบทุกเครื่อง"}
        </AccountButton>
      </div>

      {error && (
        <p className={styles.passwordError} role="alert">
          {error}
        </p>
      )}
    </>
  );
}