import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Login · ไปเรื่อย" };

export default function LoginPage() {
  return <LoginForm />;
}