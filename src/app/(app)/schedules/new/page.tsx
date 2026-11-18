import { redirect } from "next/navigation";
import ScheduleForm from "@/components/schedule/ScheduleForm";
import { BackTopBar } from "@/components/schedule/ScheduleTopBar";
import { getSessionUser } from "@/lib/auth";

export default async function NewSchedulePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <BackTopBar />
      <div className="page-content form-page">
        <div className="page-header">
          <h1>Create Schedule</h1>
        </div>
        <ScheduleForm />
      </div>
    </>
  );
}
