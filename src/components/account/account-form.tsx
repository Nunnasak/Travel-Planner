"use client";

import { ProfileSection } from "./profile-section";
import { PasswordSection } from "./password-section";
import { DangerZone } from "./danger-zone";
import { useAccountActions } from "./use-account-actions";
import { LogoutAllSection } from "./logout-all-section";
import styles from "./account-form.module.css";

export interface AccountFormProps {
  initialUsername?: string;
  email?: string;
  id?: number;
  onSaveUsername?: (newUsername: string) => Promise<void> | void;
  onUpdatePassword?: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void> | void;
  onDeleteAccount?: (password: string) => Promise<void> | void;
  onLogoutAll?: () => Promise<void> | void;
}

export function AccountForm({
  initialUsername,
  email,
  id,
  onSaveUsername,
  onUpdatePassword,
  onDeleteAccount,
  onLogoutAll,
}: AccountFormProps) {
  // ไม่ส่ง handler มา = ใช้ตัวจริงที่เรียก API
  const actions = useAccountActions();

  const safeUsername = initialUsername?.trim() || "johndoe";
  const safeEmail = email?.trim() || "name@example.com";
  const safeId = id ?? 0;

  return (
    <main className={styles.accountMain}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>บัญชีของฉัน</h1>
        <p className={styles.pageSubtitle}>
          จัดการชื่อผู้ใช้ รหัสผ่าน และการตั้งค่าบัญชีของคุณ
        </p>
      </div>

      <div className={styles.cardsStack}>
        <section aria-labelledby="account-settings-heading" className={styles.card}>
          <h2 id="account-settings-heading" className={styles.srOnly}>
            ตั้งค่าโปรไฟล์และรหัสผ่าน
          </h2>

          <div className={styles.cardSection}>
            <ProfileSection
              initialUsername={safeUsername}
              email={safeEmail}
              id={safeId}
              onSaveUsername={onSaveUsername ?? actions.saveUsername}
            />
          </div>

          <div className={styles.cardDivider} />

          <div className={styles.cardSection}>
            <PasswordSection onUpdatePassword={onUpdatePassword ?? actions.updatePassword} />
          </div>
          <div className={styles.cardDivider} />

          <div className={styles.cardSection}>
            <LogoutAllSection onLogoutAll={onLogoutAll ?? actions.logoutAllDevices} />
          </div>
        </section>

        <DangerZone email={safeEmail} onDeleteAccount={onDeleteAccount ?? actions.deleteAccount} />
      </div>
    </main>
  );
}