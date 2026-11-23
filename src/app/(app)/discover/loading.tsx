import { LoadingStatus, PlanGridSkeleton, Skel } from "@/components/ui/loading";

export default function Loading() {
  return (
    <div className="page-content discover-page" aria-busy="true">
      <LoadingStatus label="กำลังโหลดแผนเที่ยว…" />
      <div className="discover-query">
        <Skel className="skel-heading" width="min(640px, 90%)" />
        <div className="skel-row">
          {[72, 88, 64, 96, 80, 70, 90].map((width, index) => (
            <Skel key={index} className="skel-pill skel-chip" width={width} />
          ))}
        </div>
      </div>
      <div className="results-bar">
        <Skel className="skel-line" width={64} />
      </div>
      <PlanGridSkeleton count={6} />
    </div>
  );
}
