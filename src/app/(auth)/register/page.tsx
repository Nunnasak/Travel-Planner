import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Sign up · ไปเรื่อย" };

export default function RegisterPage() {
  return <RegisterForm />;
}