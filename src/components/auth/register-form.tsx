"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pickFieldErrors, postJson } from "@/lib/api-client";
import {
  EMAIL_PATTERN,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/lib/validation";
import { NETWORK_ERROR } from "@/lib/messages";
import { DEFAULT_NEXT_PATH, withNextPath } from "@/lib/redirect";

const FIELDS = ["username", "email", "password", "confirm"] as const;
type Field = (typeof FIELDS)[number];
type Errors = Partial<Record<Field, string>>;

export function RegisterForm({ redirectTo = DEFAULT_NEXT_PATH }: { redirectTo?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<Field, string>>({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const username = values.username.trim();
    const email = values.email.trim();
    const { password, confirm } = values;
    const next: Errors = {};

    if (username.length < USERNAME_MIN_LENGTH)
      next.username = `ชื่อผู้ใช้ต้องมีอย่างน้อย ${USERNAME_MIN_LENGTH} ตัวอักษร`;
    else if (username.length > USERNAME_MAX_LENGTH)
      next.username = `ชื่อผู้ใช้ต้องไม่เกิน ${USERNAME_MAX_LENGTH} ตัวอักษร`;

    if (!email) next.email = "ใส่อีเมล";
    else if (!EMAIL_PATTERN.test(email))
      next.email = "ใส่อีเมลให้ถูกรูปแบบ เช่น name@example.com";

    if (password.length < PASSWORD_MIN_LENGTH)
      next.password = `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`;

    if (!confirm) next.confirm = "ใส่รหัสผ่านอีกครั้ง";
    else if (confirm !== password) next.confirm = "รหัสผ่านทั้งสองช่องไม่ตรงกัน";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      // POST /api/auth/register  { username, email, password }
      const result = await postJson("/api/auth/register", {
        username,
        email,
        password,
      });

      if (result.ok) {
        router.push(withNextPath("/login", redirectTo));
        return;
      }

      const fieldErrors = pickFieldErrors(result.data.errors, FIELDS);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setFormError(
          result.data.message ??
            (result.status === 409
              ? "อีเมลหรือชื่อผู้ใช้นี้มีคนใช้แล้ว"
              : "สมัครสมาชิกไม่สำเร็จ ลองอีกครั้ง")
        );
      }
    } catch {
      setFormError(NETWORK_ERROR);
    }
    setLoading(false);
  }

  return (
    <section className="auth-card">
      <h1>สมัครสมาชิก</h1>
      <p className="auth-subtitle">สมัครบัญชีเพื่อเริ่มต้นสร้างแผนการท่องเที่ยว</p>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="ชื่อผู้ใช้"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="ตั้งชื่อผู้ใช้"
          value={values.username}
          onChange={(e) => update("username", e.target.value)}
          error={errors.username}
        />

        <Input
          label="อีเมล"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
        />

        <Input
          label="รหัสผ่าน"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="อย่างน้อย 8 ตัวอักษร"
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
        />

        <Input
          label="ยืนยันรหัสผ่าน"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="ใส่รหัสผ่านอีกครั้ง"
          value={values.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          error={errors.confirm}
        />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" loading={loading} loadingText="กำลังสมัครสมาชิก...">
          สมัครสมาชิก
        </Button>
      </form>

      <p className="auth-switch">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href={withNextPath("/login", redirectTo)} className="link">
          เข้าสู่ระบบ
        </Link>
      </p>
    </section>
  );
}