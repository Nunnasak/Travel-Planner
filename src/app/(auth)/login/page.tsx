import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Login · ไปเรื่อย" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  const { next } = await searchParams;
  return <LoginForm redirectTo={safeNextPath(next)} />;
}
