"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CopyButton({ scheduleId }: { scheduleId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function copy() {
    setBusy(true); setError("");
    const res = await fetch(`/api/trips/${scheduleId}/copy`, { method: "POST" });
    setBusy(false);
    if (res.status === 401) return router.push(`/login?next=/discover/${scheduleId}`);
    if (!res.ok) return setError("Couldn't duplicate this plan.");
    router.push("/schedules");
  }

  return (
    <>
      <button className="btn-coral" onClick={copy} disabled={busy}>
        {busy ? "Duplicating…" : "Duplicate to my schedule"}
      </button>
      {error && <p className="field-error">{error}</p>}
    </>
  );
}