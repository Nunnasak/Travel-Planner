"use client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { sendJson } from "@/lib/api-client";
import { NETWORK_ERROR } from "@/lib/messages";

export type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

export type PlanPatch = Partial<{
  schedule_name: string;
  description: string | null;
  total_day: number;
  categories: string[];
  cover_url: string | null;
}>;

export function usePlanPatch(scheduleId: number) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  const save = useCallback(
    async (patch: PlanPatch) => {
      setState({ kind: "saving" });
      try {
        const result = await sendJson("PATCH", `/api/schedules/${scheduleId}`, patch);
        if (!result.ok) {
          const fieldMessage = Object.values(result.data.errors ?? {})[0];
          setState({ kind: "error", message: fieldMessage ?? result.data.message ?? "บันทึกไม่สำเร็จ ลองอีกครั้ง" });
          return false;
        }
        setState({ kind: "saved" });
        router.refresh();
        return true;
      } catch {
        setState({ kind: "error", message: NETWORK_ERROR });
        return false;
      }
    },
    [router, scheduleId],
  );

  return { state, save };
}
