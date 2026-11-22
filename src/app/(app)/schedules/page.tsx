import Link from "next/link";
import { redirect } from "next/navigation";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import { scheduleService } from "@/infrastructure/container";
import { getSessionUser } from "@/lib/auth";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function MySchedulePage({ searchParams }: { searchParams: SP }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const plans = await scheduleService.listMine(user.id);
  const shown = q
    ? plans.filter((plan) =>
        `${plan.schedule_name} ${plan.description ?? ""}`.toLowerCase().includes(q.toLowerCase()),
      )
    : plans;

  return (
    <>
      <div className="page-content">
        <div className="page-header">
          <h1>My Schedule</h1>
        </div>

        {plans.length === 0 ? (
          <div className="empty">
            <p>You don't have any plans yet.</p>
            <Link href="/schedules/new" className="btn-coral">Create your first plan</Link>
          </div>
        ) : shown.length === 0 ? (
          <p className="empty">No plans match &quot;{q}&quot;.</p>
        ) : (
          <section className="plan-grid">
            {shown.map((plan, i) => <ScheduleCard key={plan.schedule_id} plan={plan} eager={i < 4} />)}
          </section>
        )}
      </div>
    </>
  );
}
