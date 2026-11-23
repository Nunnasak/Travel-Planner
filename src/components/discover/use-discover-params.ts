"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DAYS_OR_MORE } from "@/core/schema/discovery.schema";

export function dayOptions(emptyLabel: string) {
  return [
    { value: "", label: emptyLabel },
    ...Array.from({ length: DAYS_OR_MORE }, (_, i) => {
      const n = i + 1;
      return { value: String(n), label: n === DAYS_OR_MORE ? `${n} วันขึ้นไป` : `${n} วัน` };
    }),
  ];
}

export function useDiscoverParams() {
  const router = useRouter();
  const params = useSearchParams();

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const query = next.toString();
    router.push(query ? `/discover?${query}` : "/discover");
  }

  return { params, update };
}
