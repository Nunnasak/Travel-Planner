import { cookies } from "next/headers";
import { container } from "@/infrastructure/container";
import { SESSION_COOKIE } from "@/core/constants/session";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return container.getCurrentUser.execute(token);
}

export async function requireUserId(): Promise<number> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user.id;
}
