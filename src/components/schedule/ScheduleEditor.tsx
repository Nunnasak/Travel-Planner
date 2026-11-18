"use client";
import { categoryInfo } from "@/lib/categories";
import type { ScheduleDetail } from "@/lib/schedule";
import DayList from "./DayList";

export default function ScheduleEditor({ plan }: { plan: ScheduleDetail }) {
  const cat = categoryInfo(plan.category);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{plan.schedule_name}</h1>
      </div>

      <div className="detail-grid">
        <aside className="detail-side">
          <div
            className={`detail-cover ${plan.cover_url ? "" : "cover-x"}`}
            style={plan.cover_url ? { backgroundImage: `url(${plan.cover_url})` } : { backgroundColor: cat.tint }}
          >
            {!plan.cover_url && <span className="cover-badge">IMG</span>}
          </div>
          <h2>Description</h2>
          <p className="detail-desc">{plan.description || "No description yet."}</p>
          <h2>Category</h2>
          <p className="detail-desc">{cat.label}</p>
          <p className="plan-meta">
            {plan.total_day} {plan.total_day === 1 ? "day" : "days"} · {plan.is_public ? "Public" : "Private"}
            {plan.access !== "owner" && ` · by ${plan.owner.username}`}
          </p>
        </aside>

        <section className="detail-plan">
          <h2>Plan</h2>
          <DayList scheduleId={plan.schedule_id} days={plan.days} canEdit={plan.can_edit} />
        </section>
      </div>
    </div>
  );
}
