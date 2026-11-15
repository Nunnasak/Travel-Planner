import { cookies } from "next/headers";
import { container } from "@/infrastructure/container";
import { SESSION_COOKIE } from "@/core/constants/session";

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return container.getCurrentUser.execute(token);
}