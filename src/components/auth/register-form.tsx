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

const FIELDS = ["username", "email", "password", "confirm"] as const;
type Field = (typeof FIELDS)[number];
type Errors = Partial<Record<Field, string>>;

export function RegisterForm() {
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
      next.username = `Username must be at least ${USERNAME_MIN_LENGTH} characters.`;
    else if (username.length > USERNAME_MAX_LENGTH)
      next.username = `Username must be ${USERNAME_MAX_LENGTH} characters or fewer.`;

    if (!email) next.email = "Enter your email.";
    else if (!EMAIL_PATTERN.test(email))
      next.email = "Enter a valid email, like name@example.com.";

    if (password.length < PASSWORD_MIN_LENGTH)
      next.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;

    if (!confirm) next.confirm = "Re-enter your password.";
    else if (confirm !== password) next.confirm = "Passwords do not match.";

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
        router.push("/login");
        return;
      }

      const fieldErrors = pickFieldErrors(result.data.errors, FIELDS);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setFormError(
          result.data.message ??
            (result.status === 409
              ? "That email or username is already taken."
              : "Could not create the account. Please try again.")
        );
      }
    } catch {
      setFormError("Cannot reach the server. Check your connection and try again.");
    }
    setLoading(false);
  }

  return (
    <section className="auth-card">
      <h1>Sign up</h1>
      <p className="auth-subtitle">Create an account to get started</p>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="Choose a username"
          value={values.username}
          onChange={(e) => update("username", e.target.value)}
          error={errors.username}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
        />

        <Input
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={values.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          error={errors.confirm}
        />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" loading={loading} loadingText="Creating account...">
          Sign up
        </Button>
      </form>

      <p className="auth-switch">
        Already have account?{" "}
        <Link href="/login" className="link">
          Log in
        </Link>
      </p>
    </section>
  );
}