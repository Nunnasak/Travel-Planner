import type { CSSProperties } from "react";

type SkelProps = { className?: string; width?: CSSProperties["width"] };

export function Skel({ className = "", width }: SkelProps) {
  return <span className={`skel ${className}`.trim()} style={width ? { width } : undefined} aria-hidden="true" />;
}

export function LoadingStatus({ label }: { label: string }) {
  return (
    <span role="status" className="sr-only">
      {label}
    </span>
  );
}

export function RouteLoader({ label = "กำลังโหลด…" }: { label?: string }) {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <svg viewBox="0 0 220 60" aria-hidden="true">
        <path className="route-loader-line" d="M14 40 C 54 6, 78 6, 80 30 S 130 58, 144 30 S 190 8, 206 22" />
        <path className="route-loader-trail" d="M14 40 C 54 6, 78 6, 80 30 S 130 58, 144 30 S 190 8, 206 22" />
        <circle className="route-loader-stop" cx="14" cy="40" r="7" />
        <circle className="route-loader-stop" cx="80" cy="30" r="7" />
        <circle className="route-loader-stop" cx="144" cy="30" r="7" />
        <circle className="route-loader-stop" cx="206" cy="22" r="7" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

export function PlanCardSkeleton() {
  return (
    <div className="ticket-frame skel-card" aria-hidden="true">
      <div className="ticket">
        <Skel className="ticket-cover" />
        <div className="ticket-main">
          <div className="skel-row">
            <Skel className="skel-pill" width={64} />
            <Skel className="skel-pill" width={76} />
          </div>
          <Skel className="skel-title" width="80%" />
          <Skel className="skel-line" width="60%" />
          <Skel className="skel-line" width="45%" />
        </div>
        <div className="ticket-stub">
          <Skel className="skel-title" />
          <Skel className="skel-line" width={48} />
        </div>
      </div>
    </div>
  );
}

export function PlanGridSkeleton({ count }: { count: number }) {
  return (
    <section className="plan-grid">
      {Array.from({ length: count }, (_, index) => (
        <PlanCardSkeleton key={index} />
      ))}
    </section>
  );
}

function StopSkeleton({ last }: { last: boolean }) {
  return (
    <div className={`stop-row skel-stop ${last ? "is-last" : ""}`}>
      <span className="stop-time">
        <Skel className="skel-line" width={44} />
      </span>
      <span className="stop-ring" />
      <Skel className="stop-thumb" />
      <div className="stop-info">
        <Skel className="skel-title" width="55%" />
        <Skel className="skel-line" width="35%" />
      </div>
    </div>
  );
}

export function PlanDetailSkeleton({ label }: { label: string }) {
  return (
    <div className="page-content" aria-busy="true">
      <LoadingStatus label={label} />
      <div className="page-header">
        <Skel className="skel-heading" />
        <Skel className="skel-button" />
      </div>

      <div className="detail-grid detail-grid-map">
        <aside className="detail-side">
          <Skel className="detail-cover" />
          <Skel className="skel-title" width="45%" />
          <Skel className="skel-line" />
          <Skel className="skel-line" width="85%" />
          <Skel className="skel-line" width="60%" />
          <div className="skel-row">
            <Skel className="skel-pill" width={64} />
            <Skel className="skel-pill" width={80} />
          </div>
        </aside>

        <section className="detail-plan">
          <Skel className="skel-title" width={160} />
          {[3, 2].map((stops, day) => (
            <div key={day}>
              <div className="day-divider">
                <Skel className="skel-title" width={84} />
              </div>
              {Array.from({ length: stops }, (_, index) => (
                <StopSkeleton key={index} last={index === stops - 1} />
              ))}
            </div>
          ))}
        </section>

        <aside className="detail-map">
          <Skel className="skel-title" width={80} />
          <Skel className="skel-map" />
        </aside>
      </div>
    </div>
  );
}
