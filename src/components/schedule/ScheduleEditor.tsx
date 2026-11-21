"use client";
import { useState } from "react";
import type { ScheduleDetail } from "@/lib/schedule";
import DayList from "./DayList";
import InlineTitle from "./InlineTitle";
import PlanInfoPanel from "./PlanInfoPanel";
import ShareDialog from "./ShareDialog";
import { usePlanPatch } from "./usePlanPatch";

export default function ScheduleEditor({ plan }: { plan: ScheduleDetail }) {
  const { state, save } = usePlanPatch(plan.schedule_id);
  const [sharing, setSharing] = useState(false);
  const status = state.kind === "saving" ? "Saving…" : state.kind === "saved" ? "Saved" : "";

  return (
    <div className="page-content">
      <div className="page-header">
        {plan.can_edit ? <InlineTitle value={plan.schedule_name} onSave={save} /> : <h1>{plan.schedule_name}</h1>}
        <div className="header-actions">
          {status && <span className="save-status" role="status">{status}</span>}
          <button type="button" className="btn-coral" onClick={() => setSharing(true)}>
            Share
          </button>
        </div>
      </div>

      {state.kind === "error" && <p className="form-error" role="alert">{state.message}</p>}

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
