import { NotFoundError } from "@/core/errors/not-found.error";
import { idSchema } from "@/core/schema/discovery.schema";

export function parseRouteId(value: string, message = "Not found."): number {
  const id = idSchema.safeParse(value);
  if (!id.success) throw new NotFoundError(message);
  return id.data;
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
