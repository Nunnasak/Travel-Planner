"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const CHECK_EVERY_MS = 5000;
const BUSY_SELECTOR = ".modal-backdrop, .stop-row.is-dragging, .day-list.is-saving";
const TYPING_SELECTOR = "input, textarea, select, [contenteditable='true']";

function userIsBusy() {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.matches(TYPING_SELECTOR)) return true;
  return document.querySelector(BUSY_SELECTOR) !== null;
}

export function useLiveRefresh(scheduleId: number, version: string) {
  const router = useRouter();
  const known = useRef(version);

  useEffect(() => {
    known.current = version;
  }, [version]);

  useEffect(() => {
    let stopped = false;
    let checking = false;

    async function check() {
      if (stopped || checking || document.hidden) return;
      checking = true;
      try {
        const res = await fetch(`/api/schedules/${scheduleId}/version`, { cache: "no-store" });
        if (!res.ok) {
          if ([401, 403, 404].includes(res.status)) {
            stopped = true;
            router.refresh();
          }
          return;
        }
        const { version: latest } = (await res.json()) as { version: string };
        if (latest === known.current || userIsBusy()) return;
        known.current = latest;
        router.refresh();
      } catch {
      } finally {
        checking = false;
      }
    }

    const timer = setInterval(check, CHECK_EVERY_MS);
    const onVisible = () => {
      if (!document.hidden) void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [scheduleId, router]);
}
