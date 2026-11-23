const MAX_STOPS = 7;
const LEADING_STOPS = 3;

function stopsFor(days: number) {
  const total = Math.max(1, days);
  if (total <= MAX_STOPS) return Array.from({ length: total }, (_, i) => i + 1);
  return [...Array.from({ length: LEADING_STOPS }, (_, i) => i + 1), total];
}

export default function RouteStops({ days }: { days: number }) {
  const stops = stopsFor(days);
  const skipped = days > MAX_STOPS;

  return (
    <span className="route-stops" aria-hidden="true">
      {stops.map((day, i) => (
        <span key={day} className="route-step">
          {i > 0 && (
            <span className={`route-seg${skipped && i === stops.length - 1 ? " is-gap" : ""}`} />
          )}
          <span className="route-stop">
            <span className="route-dot" />
            <span className="route-day">{day}</span>
          </span>
        </span>
      ))}
    </span>
  );
}
