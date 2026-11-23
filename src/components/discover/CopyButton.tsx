"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendJson } from "@/lib/api-client";
import { NETWORK_ERROR } from "@/lib/messages";

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
        setError(result.data.message ?? "คัดลอกแผนไม่สำเร็จ ลองอีกครั้ง");
        setBusy(false);
        return;
      }
      router.push(`/schedules/${result.data.schedule_id}`);
    } catch {
      setError(NETWORK_ERROR);
      setBusy(false);
    }
  }

  return (
    <div className="copy-action">
      <button type="button" className="btn-coral" onClick={copy} disabled={busy}>
        {busy ? "กำลังคัดลอก…" : "คัดลอกไปที่แผนของฉัน"}
      </button>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
