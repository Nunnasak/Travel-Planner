import Link from "next/link";
import CategoryTags from "@/components/ui/category-tags";
import CoverImage, { CARD_IMAGE_SIZES } from "@/components/ui/cover-image";
import { coverTintClass } from "@/lib/categories";
import type { PlanItem } from "@/lib/discovery";

export default function PlanCard({ plan, eager = false }: { plan: PlanItem; eager?: boolean }) {
  return (
    <Link href={`/discover/${plan.schedule_id}`} className="plan-card">
      <div className={`plan-cover ${plan.cover_url ? "" : `cover-x ${coverTintClass(plan.categories)}`}`}>
        {plan.cover_url ? (
          <CoverImage src={plan.cover_url} alt="" sizes={CARD_IMAGE_SIZES} eager={eager} />
        ) : (
          <span className="cover-badge">IMG</span>
        )}
        <CategoryTags categories={plan.categories} max={2} />
      </div>
      <div className="plan-body">
        <h3>{plan.schedule_name}</h3>
        <p className="plan-desc">{plan.description}</p>
      </div>
    </Link>
  );
}