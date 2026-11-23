"use client";
import { useState } from "react";
import type { ScheduleDetail } from "@/lib/schedule";
import DayList from "./DayList";
import InlineTitle from "./InlineTitle";
import PlanInfoPanel from "./PlanInfoPanel";
import PlanMapColumn from "./PlanMapColumn";
import ShareDialog from "./ShareDialog";
import { usePlanPatch } from "./usePlanPatch";

export default function ScheduleEditor({ plan }: { plan: ScheduleDetail }) {
  const { state, save } = usePlanPatch(plan.schedule_id);
  const [sharing, setSharing] = useState(false);
  const status = state.kind === "saving" ? "กำลังบันทึก…" : state.kind === "saved" ? "บันทึกแล้ว" : "";

  return (
    <div className="page-content">
      <div className="page-header">
        {plan.can_edit ? <InlineTitle value={plan.schedule_name} onSave={save} /> : <h1>{plan.schedule_name}</h1>}
        <div className="header-actions">
          {status && <span className="save-status" role="status">{status}</span>}
          <button type="button" className="btn-coral" onClick={() => setSharing(true)}>
            แชร์
          </button>
        </div>
      </div>

      {state.kind === "error" && <p className="form-error" role="alert">{state.message}</p>}

      <div className="detail-grid detail-grid-map">
        <PlanInfoPanel plan={plan} onSave={save} />

        <section className="detail-plan">
          <div className="plan-head">
            <h2>แผนการเดินทาง</h2>
          </div>
          <DayList
            scheduleId={plan.schedule_id}
            totalDays={plan.total_day}
            days={plan.days}
            canEdit={plan.can_edit}
          />
        </section>

        <aside className="detail-map" aria-label="แผนที่">
          <h2>แผนที่</h2>
          <PlanMapColumn days={plan.days} />
        </aside>
      </div>

      {sharing && <ShareDialog scheduleId={plan.schedule_id} onClose={() => setSharing(false)} />}
    </div>
  );
}
