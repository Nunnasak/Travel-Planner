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

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{plan.schedule_name}</h1>
        <CopyButton scheduleId={plan.schedule_id} />
      </div>

      <div className="detail-grid detail-grid-map">
        <aside className="detail-side">
          <div className={`detail-cover ${coverUrl ? "" : `cover-x ${coverTintClass(plan.categories)}`}`}>
            {coverUrl ? (
              <CoverImage src={coverUrl} alt={plan.schedule_name} sizes="240px" eager />
            ) : (
              <span className="cover-badge">IMG</span>
            )}
          </div>
          <h2>Description</h2>
          <p className="detail-desc">{plan.description || "No description yet."}</p>
          <h2>Category</h2>
          <CategoryTags categories={plan.categories} className="tag-list" />
        </aside>

        <section className="detail-plan">
          <h2>Plan</h2>
          {plan.days.map((d) => (
            <div key={d.day_no} id={`day-${d.day_no}`}>
              <div className="day-divider">DAY {d.day_no}</div>
              {d.stops.map((s, i) => (
                <div className="stop-row" key={s.item_id}>
                  <div
                    className={`stop-thumb ${
                      s.location.image_url ? "" : `cover-x ${tintClass(TINTS[(d.day_no + i) % TINTS.length])}`
                    }`}
                  >
                    {s.location.image_url ? (
                      <CoverImage src={s.location.image_url} alt={s.location.name} sizes="60px" />
                    ) : (
                      <span className="cover-badge">IMG</span>
                    )}
                  </div>
                  <div className="stop-info">
                    <strong>{s.location.name}</strong>
                    <span>{s.location.address}</span>
                  </div>
                  <span className="stop-time">{formatVisitTime(s.visit_time)}</span>
                </div>
              ))}
            </div>
          ))}
        </section>

        <aside className="detail-map" aria-label="Map">
          <h2>Map</h2>
          <PlanMapColumn days={plan.days} />
        </aside>
      </div>
    </div>
  );
}
