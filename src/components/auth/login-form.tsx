"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pickFieldErrors, postJson } from "@/lib/api-client";
import { EMAIL_PATTERN } from "@/lib/validation";

type Field = "email" | "password";
type Errors = Partial<Record<Field, string>>;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function clearError(field: Field) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const trimmedEmail = email.trim();
    const next: Errors = {};
    if (!trimmedEmail) next.email = "Enter your email.";
    else if (!EMAIL_PATTERN.test(trimmedEmail))
      next.email = "Enter a valid email, like name@example.com.";
    if (!password) next.password = "Enter your password.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      // POST /api/auth/login  { email, password }
      const result = await postJson("/api/auth/login", {
        email: trimmedEmail,
        password,
      });

      if (result.ok) {
        router.push("/trips");
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
              ? "Email or password is incorrect."
              : "Could not log in. Please try again.")
        );
      }
    } catch {
      setFormError("Cannot reach the server. Check your connection and try again.");
    }
    setLoading(false);
  }

  return (
    <section className="auth-card">
      <h1>Login</h1>
      <p className="auth-subtitle">Sign in to manage your schedule</p>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
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
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
          error={errors.password}
        />

        <div className="auth-row">
          <Link href="#" className="link">
            Forgot password?
          </Link>
        </div>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" loading={loading} loadingText="Signing in...">
          Login
        </Button>
      </form>

      <p className="auth-switch">
        Don&apos;t have account?{" "}
        <Link href="/register" className="link">
          Sign up
        </Link>
      </p>
    </section>
  );
}