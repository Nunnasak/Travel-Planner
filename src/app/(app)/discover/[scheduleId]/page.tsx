import { notFound } from "next/navigation";
import CopyButton from "@/components/discover/CopyButton";
import PlanMapColumn from "@/components/schedule/PlanMapColumn";
import CategoryTags from "@/components/ui/category-tags";
import CoverImage from "@/components/ui/cover-image";
import { NotFoundError } from "@/core/errors/not-found.error";
import { idSchema } from "@/core/schema/discovery.schema";
import { discoveryService } from "@/infrastructure/container";
import { coverTintClass, TINTS, tintClass } from "@/lib/categories";
import type { PlanDetail as Plan } from "@/lib/discovery";
import { placeLine } from "@/lib/place";
import { formatVisitTime } from "@/lib/schedule";

async function loadPlan(scheduleId: string): Promise<Plan | null> {
  const id = idSchema.safeParse(scheduleId);
  if (!id.success) return null;
  try {
    return await discoveryService.getPublic(id.data);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

export default async function PlanDetail({ params }: { params: Promise<{ scheduleId: string }> }) {
  const { scheduleId } = await params;
  const plan = await loadPlan(scheduleId);
  if (!plan) notFound();

  const coverUrl =
    plan.cover_url ??
    plan.days.flatMap((d) => d.stops).find((s) => s.location.image_url)?.location.image_url ??
    null;
  const stopCount = plan.days.reduce((sum, d) => sum + d.stops.length, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title">
          <h1>{plan.schedule_name}</h1>
          <p className="page-sub">
            {plan.days.length} วัน, {stopCount} จุดแวะ
          </p>
        </div>
        <CopyButton scheduleId={plan.schedule_id} />
      </div>

      <div className="detail-grid detail-grid-map">
        <aside className="detail-side">
          <div className={`detail-cover ${coverUrl ? "" : `cover-x ${coverTintClass(plan.categories)}`}`}>
            {coverUrl ? (
              <CoverImage src={coverUrl} alt={plan.schedule_name} sizes="240px" eager />
            ) : (
              <span className="cover-badge">ไม่มีรูป</span>
            )}
          </div>
          <h2>รายละเอียด</h2>
          <p className="detail-desc">{plan.description || "ยังไม่มีคำอธิบาย"}</p>
          <h2>หมวดหมู่</h2>
          <CategoryTags categories={plan.categories} className="tag-list" />
        </aside>

        <section className="detail-plan">
          <h2>แผนการเดินทาง</h2>
          {plan.days.map((d) => (
            <div key={d.day_no} id={`day-${d.day_no}`}>
              <div className="day-divider">วันที่ {d.day_no}</div>
              {d.stops.map((s, i) => (
                <div className={`stop-row${i === d.stops.length - 1 ? " is-last" : ""}`} key={s.item_id}>
                  <span className="stop-time">{formatVisitTime(s.visit_time)}</span>
                  <span className="stop-ring" aria-hidden="true">{i + 1}</span>
                  <div
                    className={`stop-thumb ${
                      s.location.image_url ? "" : `cover-x ${tintClass(TINTS[(d.day_no + i) % TINTS.length])}`
                    }`}
                  >
                    {s.location.image_url ? (
                      <CoverImage src={s.location.image_url} alt={s.location.name} sizes="60px" />
                    ) : (
                      <span className="cover-badge">ไม่มีรูป</span>
                    )}
                  </div>
                  <div className="stop-info">
                    <strong>{s.location.name}</strong>
                    <span>{placeLine(s.location)}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>

        <aside className="detail-map" aria-label="แผนที่">
          <h2>แผนที่</h2>
          <PlanMapColumn days={plan.days} />
        </aside>
      </div>
    </div>
  );
}
