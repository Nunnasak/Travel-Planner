"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/api-client";
import type { ScheduleDetail } from "@/lib/schedule";
import DayList from "./DayList";
import InlineTitle from "./InlineTitle";
import PlanInfoPanel from "./PlanInfoPanel";
import ShareDialog from "./ShareDialog";
import { usePlanPatch } from "./usePlanPatch";

export default function ScheduleEditor({ plan }: { plan: ScheduleDetail }) {
  const router = useRouter();
  const { state, save } = usePlanPatch(plan.schedule_id);
  const [sharing, setSharing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const status = state.kind === "saving" ? "Saving…" : state.kind === "saved" ? "Saved" : "";

  async function remove() {
    if (!confirm(`Delete "${plan.schedule_name}"? This can't be undone.`)) return;
    setBusy(true);
    setError("");
    const result = await sendJson("DELETE", `/api/schedules/${plan.schedule_id}`);
    if (!result.ok) {
      setBusy(false);
      return setError(result.data.message ?? "Couldn't delete this plan.");
    }
    router.push("/schedules");
    router.refresh();
  }

  return (
    <div className="page-content">
      <div className="page-header">
        {plan.can_edit ? <InlineTitle value={plan.schedule_name} onSave={save} /> : <h1>{plan.schedule_name}</h1>}
        <div className="header-actions">
          {status && <span className="save-status" role="status">{status}</span>}
          {plan.access === "owner" && (
            <button type="button" className="btn-outline danger" onClick={remove} disabled={busy}>
              Delete
            </button>
          )}
          <button type="button" className="btn-coral" onClick={() => setSharing(true)}>
            Share
          </button>
        </div>
      </div>

      {state.kind === "error" && <p className="form-error" role="alert">{state.message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="detail-grid">
        <PlanInfoPanel plan={plan} onSave={save} />

        <section className="detail-plan">
          <div className="plan-head">
            <h2>Plan</h2>
          </div>
          <DayList
            scheduleId={plan.schedule_id}
            totalDays={plan.total_day}
            days={plan.days}
            canEdit={plan.can_edit}
          />
        </section>
      </div>

      {sharing && <ShareDialog scheduleId={plan.schedule_id} onClose={() => setSharing(false)} />}
    </div>
  );
}
