import Link from "next/link";
import CategoryTags from "@/components/ui/category-tags";
import { coverTint } from "@/lib/categories";
import type { PlanItem } from "@/lib/discovery";

export default function PlanCard({ plan }: { plan: PlanItem }) {
  return (
    <Link href={`/discover/${plan.schedule_id}`} className="plan-card">
      <div
        className={`plan-cover ${plan.cover_url ? "" : "cover-x"}`}
        style={plan.cover_url ? { backgroundImage: `url(${plan.cover_url})` } : { backgroundColor: coverTint(plan.categories) }}
      >
        {!plan.cover_url && <span className="cover-badge">IMG</span>}
        <CategoryTags categories={plan.categories} max={2} />
      </div>
      <div className="plan-body">
        <h3>{plan.schedule_name}</h3>
        <p className="plan-desc">{plan.description}</p>
      </div>
    </Link>
  );
}