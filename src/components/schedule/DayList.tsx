"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/api-client";
import { formatVisitTime, type ScheduleDay } from "@/lib/schedule";
import AddPlaceModal from "./AddPlaceModal";

const TINTS = ["#FFF0C2", "#FFDDD6", "#D6F1F7", "#E6E0FF", "#D3F3EE"];

type Props = {
  scheduleId: number;
  totalDays: number;
  days: ScheduleDay[];
  canEdit: boolean;
};

export default function DayList({ scheduleId, totalDays, days, canEdit }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [addDay, setAddDay] = useState<number | null>(null);

  async function remove(itemId: number, name: string) {
    if (!confirm(`Remove "${name}" from this plan?`)) return;
    setBusyId(itemId);
    setError("");
    const result = await sendJson("DELETE", `/api/schedules/${scheduleId}/items/${itemId}`);
    setBusyId(null);
    if (!result.ok) return setError(result.data.message ?? "Couldn't remove this place.");
    router.refresh();
  }

  return (
    <div className="day-list">
      {error && <p className="form-error" role="alert">{error}</p>}
      {days.map((day) => (
        <div key={day.day_no} className="day-block">
          <div className="day-divider">DAY {day.day_no}</div>
          {day.stops.length === 0 && <p className="day-empty">No places yet.</p>}
          {day.stops.map((stop, index) => (
            <div className={`stop-row ${busyId === stop.item_id ? "is-busy" : ""}`} key={stop.item_id}>
              {canEdit && <span className="drag-handle" aria-hidden>⋮⋮</span>}
              <div
                className={`stop-thumb ${stop.location.image_url ? "" : "cover-x"}`}
                style={
                  stop.location.image_url
                    ? { backgroundImage: `url(${stop.location.image_url})`, backgroundSize: "cover" }
                    : { backgroundColor: TINTS[(day.day_no + index) % TINTS.length] }
                }
              >
                {!stop.location.image_url && <span className="cover-badge">IMG</span>}
              </div>
              <div className="stop-info">
                <strong>{stop.location.name}</strong>
                <span>{stop.location.address}</span>
              </div>
              <span className="stop-time">{formatVisitTime(stop.visit_time)}</span>
              {canEdit && (
                <button
                  type="button"
                  className="stop-remove"
                  aria-label={`Remove ${stop.location.name}`}
                  onClick={() => remove(stop.item_id, stop.location.name)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {canEdit && day.day_no <= totalDays && (
            <button type="button" className="add-place-btn" onClick={() => setAddDay(day.day_no)}>
              + Add plan
            </button>
          )}
        </div>
      ))}
      {addDay !== null && (
        <AddPlaceModal
          scheduleId={scheduleId}
          totalDays={totalDays}
          initialDay={addDay}
          onClose={() => setAddDay(null)}
        />
      )}
    </div>
  );
}
