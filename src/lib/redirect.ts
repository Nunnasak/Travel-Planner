export const DEFAULT_NEXT_PATH = "/discover";

export function safeNextPath(value: unknown, fallback = DEFAULT_NEXT_PATH): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

export function withNextPath(path: string, next: string): string {
  return next === DEFAULT_NEXT_PATH ? path : `${path}?next=${encodeURIComponent(next)}`;
}
