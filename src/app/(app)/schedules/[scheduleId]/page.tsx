import { notFound, redirect } from "next/navigation";
import ScheduleEditor from "@/components/schedule/ScheduleEditor";
import { BackTopBar } from "@/components/schedule/ScheduleTopBar";
import { NotFoundError } from "@/core/errors/not-found.error";
import { idSchema } from "@/core/schema/discovery.schema";
import { scheduleService } from "@/infrastructure/container";
import { getSessionUser } from "@/lib/auth";

export default async function SchedulePage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const id = idSchema.safeParse((await params).scheduleId);
  if (!id.success) notFound();

  const plan = await scheduleService.getForUser(id.data, user.id).catch((error: unknown) => {
    if (error instanceof NotFoundError) return null;
    throw error;
  });
  if (!plan) notFound();

  return (
    <>
      <BackTopBar />
      <ScheduleEditor plan={plan} />
    </>
  );
}
