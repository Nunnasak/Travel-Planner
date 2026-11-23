import { LoadingStatus, PlanGridSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <div className="page-content" aria-busy="true">
      <LoadingStatus label="กำลังโหลดแผนของคุณ…" />
      <div className="page-header">
        <h1>แผนของฉัน</h1>
      </div>
      <PlanGridSkeleton count={4} />
    </div>
  );
}
