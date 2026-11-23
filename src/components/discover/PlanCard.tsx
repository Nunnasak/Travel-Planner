import TicketCard from "@/components/ui/ticket-card";
import type { PlanItem } from "@/lib/discovery";

const MAX_PROVINCES = 2;

function provinceLabel(provinces: string[]) {
  if (provinces.length === 0) return null;
  const shown = provinces.slice(0, MAX_PROVINCES).join(", ");
  const more = provinces.length - MAX_PROVINCES;
  return more > 0 ? `${shown} +${more}` : shown;
}

export default function PlanCard({ plan, eager = false }: { plan: PlanItem; eager?: boolean }) {
  return (
    <TicketCard
      href={`/discover/${plan.schedule_id}`}
      title={plan.schedule_name}
      subtitle={provinceLabel(plan.provinces) ?? plan.description}
      coverUrl={plan.cover_url}
      categories={plan.categories}
      days={plan.total_day}
      placeCount={plan.place_count}
      eager={eager}
    />
  );
}
