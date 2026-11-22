import { redirect } from "next/navigation";
import ScheduleForm from "@/components/schedule/ScheduleForm";
import { getSessionUser } from "@/lib/auth";

export default async function NewSchedulePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="page-content create-page">
      <div className="create-heading">
        <h1>Create a plan</h1>
        <p>Give your trip a name and a few details. You&apos;ll add places on the next page.</p>
      </div>
      <ScheduleForm />
    </div>
  );
}
