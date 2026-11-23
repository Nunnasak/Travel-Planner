"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pickFieldErrors, postJson } from "@/lib/api-client";
import { NETWORK_ERROR } from "@/lib/messages";
import { EMAIL_PATTERN } from "@/lib/validation";

type Field = "email" | "password";
type Errors = Partial<Record<Field, string>>;

export function LoginForm({ redirectTo = "/discover" }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  function clearError(field: Field) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const trimmedEmail = email.trim();
    const next: Errors = {};
    if (!trimmedEmail) next.email = "ใส่อีเมล";
    else if (!EMAIL_PATTERN.test(trimmedEmail))
      next.email = "ใส่อีเมลให้ถูกรูปแบบ เช่น name@example.com";
    if (!password) next.password = "ใส่รหัสผ่าน";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      // POST /api/auth/login  { email, password }
      const result = await postJson("/api/auth/login", {
        email: trimmedEmail,
        password,
        remember: agree,
      });

      if (result.ok) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      const fieldErrors = pickFieldErrors(result.data.errors, ["email", "password"] as const);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setFormError(
          result.data.message ??
          (result.status === 401
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : "เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง")
        );
      }
    } catch {
      setFormError(NETWORK_ERROR);
    }
    setLoading(false);
  }

  return (
    <section className="auth-card">
      <h1>เข้าสู่ระบบ</h1>
      <p className="auth-subtitle">เข้าสู่ระบบเพื่อจัดแผนท่องเที่ยว</p>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="อีเมล"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError("email");
          }}
          error={errors.email}
        />

        <Input
          label="รหัสผ่าน"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="ใส่รหัสผ่าน"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
          error={errors.password}
        />

        <label className="check">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>จดจำการเข้าสู่ระบบ 30 วัน</span>
        </label>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" loading={loading} loadingText="กำลังเข้าสู่ระบบ...">
          เข้าสู่ระบบ
        </Button>
      </form>

      <p className="auth-switch">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="link">
          สมัครสมาชิก
        </Link>
      </p>
    </section>
  );
}