import { redirect } from "next/navigation";
import ScheduleForm from "@/components/schedule/ScheduleForm";
import { getSessionUser } from "@/lib/auth";

export default async function NewSchedulePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="page-content create-page">
      <div className="create-heading">
        <h1>สร้างแผนใหม่</h1>
        <p>ตั้งชื่อทริปและใส่รายละเอียดเล็กน้อย จะได้เพิ่มสถานที่ในหน้าถัดไป</p>
      </div>
      <ScheduleForm />
    </div>
  );
}
