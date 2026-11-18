import Link from "next/link";
import { categoryInfo } from "@/lib/categories";
import type { PlanItem } from "@/lib/discovery";

export default function PlanCard({ plan }: { plan: PlanItem }) {
  const cat = categoryInfo(plan.category);
  return (
    <Link href={`/discover/${plan.schedule_id}`} className="plan-card">
      <div
        className={`plan-cover ${plan.cover_url ? "" : "cover-x"}`}
        style={plan.cover_url ? { backgroundImage: `url(${plan.cover_url})` } : { backgroundColor: cat.tint }}
      >
        {!plan.cover_url && <span className="cover-badge">IMG</span>}
        <span className="tag">{cat.label}</span>
      </div>
      <div className="plan-body">
        <h3>{plan.schedule_name}</h3>
        <p className="plan-desc">{plan.description}</p>
      </div>
    </Link>
  );
}