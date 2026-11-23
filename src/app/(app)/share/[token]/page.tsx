import Link from "next/link";
import { redirect } from "next/navigation";
import { ForbiddenError } from "@/core/errors/forbidden.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { shareService } from "@/infrastructure/container";
import { getSessionUser } from "@/lib/auth";
import { toThai } from "@/lib/messages";

export default async function SharedPlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/share/${token}`)}`);

  let scheduleId: number;
  try {
    scheduleId = await shareService.joinByToken(token, user.id);
  } catch (error) {
    if (!(error instanceof ForbiddenError) && !(error instanceof NotFoundError)) throw error;
    return (
      <div className="page-content">
        <div className="empty share-denied">
          <h1>คุณยังไม่มีสิทธิ์เข้าถึงแผนนี้</h1>
          <p>{toThai(error.message)}</p>
          <Link href="/schedules" className="btn-coral">ไปที่แผนของฉัน</Link>
        </div>
      </div>
    );
  }
  redirect(`/schedules/${scheduleId}`);
}
