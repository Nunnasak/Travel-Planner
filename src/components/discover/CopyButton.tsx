"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendJson } from "@/lib/api-client";

export default function CopyButton({ scheduleId }: { scheduleId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function copy() {
    setBusy(true);
    setError("");
    try {
      const result = await sendJson("POST", `/api/schedules/${scheduleId}/copy`);
      if (result.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/discover/${scheduleId}`)}`);
        return;
      }
      if (!result.ok) {
        setError(result.data.message ?? "Couldn't duplicate this plan.");
        setBusy(false);
        return;
      }
      router.push(`/schedules/${result.data.schedule_id}`);
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div className="copy-action">
      <button type="button" className="btn-coral" onClick={copy} disabled={busy}>
        {busy ? "Duplicating…" : "Duplicate to my schedule"}
      </button>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
