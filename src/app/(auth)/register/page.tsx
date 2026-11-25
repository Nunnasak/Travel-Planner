import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "สมัครสมาชิก · ไปเรื่อย" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({ searchParams }: { searchParams: SP }) {
  const { next } = await searchParams;
  return <RegisterForm redirectTo={safeNextPath(next)} />;
}