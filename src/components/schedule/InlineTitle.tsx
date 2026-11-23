"use client";
import { useEffect, useState } from "react";
import type { PlanPatch } from "./usePlanPatch";

type Props = { value: string; onSave: (patch: PlanPatch) => Promise<boolean> };

export default function InlineTitle({ value, onSave }: Props) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  async function commit() {
    const next = draft.trim();
    if (!next || next === value) return setDraft(value);
    if (!(await onSave({ schedule_name: next }))) setDraft(value);
  }

  return (
    <input
      className="inline-title"
      aria-label="ชื่อแผน"
      maxLength={100}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(value);
          requestAnimationFrame(() => (e.target as HTMLInputElement).blur());
        }
      }}
    />
  );
}
