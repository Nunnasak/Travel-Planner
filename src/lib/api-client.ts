// Small fetch helper for the frontend forms.

export type ApiResult = {
  ok: boolean;
  status: number;
  data: { message?: string; errors?: Record<string, string> };
};

export async function postJson(url: string, body: unknown): Promise<ApiResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  let data: ApiResult["data"] = {};
  try {
    data = await response.json();
  } catch {
    // response had no JSON body
  }
  return { ok: response.ok, status: response.status, data };
}

// Keep only the field errors the form actually has.
export function pickFieldErrors<K extends string>(
  errors: Record<string, string> | undefined,
  keys: readonly K[]
): Partial<Record<K, string>> {
  const picked: Partial<Record<K, string>> = {};
  if (!errors) return picked;
  for (const key of keys) {
    if (errors[key]) picked[key] = errors[key];
  }
  return picked;
}