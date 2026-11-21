import { notFound } from "next/navigation";
import CopyButton from "@/components/discover/CopyButton";
import { categoryInfo } from "@/lib/categories";
import { NotFoundError } from "@/core/errors/not-found.error";
import { discoveryService } from "@/infrastructure/container";
import type { PlanDetail as Plan } from "@/lib/discovery";

// Largest value a Postgres INT column can hold.
const MAX_INT4 = 2_147_483_647;

// Plain digits that fit an INT column; anything else is not a real plan id.
function parseId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return id >= 1 && id <= MAX_INT4 ? id : null;
}

async function loadPlan(scheduleId: string): Promise<Plan | null> {
  const id = parseId(scheduleId);
  if (id === null) return null;
  try {
    return await discoveryService.getPublic(id);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

const TINTS = ["#FFF0C2", "#FFDDD6", "#D6F1F7", "#E6E0FF", "#D3F3EE"];

function fmtTime(t: string | null) {
  const m = t?.match(/(\d{1,2}):(\d{2})/);
  if (!m) return "--:--";
  const h = Number(m[1]);
  return `${String(h % 12 || 12).padStart(2, "0")}:${m[2]} ${h >= 12 ? "PM" : "AM"}`;
}

export default async function PlanDetail({ params }: { params: Promise<{ scheduleId: string }> }) {
  const { scheduleId } = await params;
  const plan = await loadPlan(scheduleId);
  if (!plan) notFound();
  const cat = categoryInfo(plan.category);

  // หา image_url แรกที่มีอยู่ในทริปมาใช้เป็นรูปปก
  const coverUrl =
    plan.days
      .flatMap((d) => d.stops)
      .find((s) => s.location.image_url)?.location.image_url ?? null;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{plan.schedule_name}</h1>
        <CopyButton scheduleId={plan.schedule_id} />
      </div>

      <div className="detail-grid">
        <aside className="detail-side">
          <div
            className={`detail-cover ${!coverUrl ? "cover-x" : ""}`}
            style={{ backgroundColor: cat.tint }}
          >
            {coverUrl ? (
              <img src={coverUrl} alt={plan.schedule_name} className="cover-img" />
            ) : (
              <span className="cover-badge">IMG</span>
            )}
          </div>
          <h2>Description</h2>
          <p className="detail-desc">{plan.description}</p>
        </aside>

        <section className="detail-plan">
          <h2>Plan</h2>
          {plan.days.map((d) => (
            <div key={d.day_no}>
              <div className="day-divider">DAY {d.day_no}</div>
              {d.stops.map((s, i) => (
                <div className="stop-row" key={s.item_id}>
                  <div
                    className={`stop-thumb ${!s.location.image_url ? "cover-x" : ""}`}
                    style={{ backgroundColor: TINTS[(d.day_no + i) % TINTS.length] }}
                  >
                    {s.location.image_url ? (
                      <img
                        src={s.location.image_url}
                        alt={s.location.name}
                        className="cover-img"
                      />
                    ) : (
                      <span className="cover-badge">IMG</span>
                    )}
                  </div>
                  <div className="stop-info">
                    <strong>{s.location.name}</strong>
                    <span>{s.location.address}</span>
                  </div>
                  <span className="stop-time">{fmtTime(s.visit_time)}</span>
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}