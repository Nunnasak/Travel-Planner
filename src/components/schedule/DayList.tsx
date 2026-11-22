"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { sendJson } from "@/lib/api-client";
import { formatVisitTime, type ScheduleDay, type ScheduleStop } from "@/lib/schedule";
import AddPlaceModal from "./AddPlaceModal";

const TINTS = ["#FFF0C2", "#FFDDD6", "#D6F1F7", "#E6E0FF", "#D3F3EE"];

function orderKey(days: ScheduleDay[]) {
  return days.map((day) => `${day.day_no}:${day.stops.map((s) => s.item_id).join(",")}`).join("|");
}

function moveStop(days: ScheduleDay[], itemId: number, toDay: number, toIndex: number) {
  let moving: ScheduleStop | undefined;
  const without = days.map((day) => ({
    ...day,
    stops: day.stops.filter((stop) => {
      if (stop.item_id !== itemId) return true;
      moving = stop;
      return false;
    }),
  }));
  if (!moving) return days;
  const stop = moving;
  return without.map((day) =>
    day.day_no === toDay
      ? { ...day, stops: [...day.stops.slice(0, toIndex), stop, ...day.stops.slice(toIndex)] }
      : day,
  );
}

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
  const [pendingRemove, setPendingRemove] = useState<{ itemId: number; name: string } | null>(null);
  const [order, setOrder] = useState(days);
  const [dragId, setDragId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const orderRef = useRef(days);
  const draggingRef = useRef(false);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    setOrder(days);
    orderRef.current = days;
  }, [days]);

  useEffect(() => {
    if (dragId === null) return;
    const finish = () => finishRef.current();
    document.addEventListener("dragend", finish);
    document.addEventListener("drop", finish);
    return () => {
      document.removeEventListener("dragend", finish);
      document.removeEventListener("drop", finish);
    };
  }, [dragId]);

  function update(next: ScheduleDay[]) {
    if (orderKey(next) === orderKey(orderRef.current)) return;
    orderRef.current = next;
    setOrder(next);
  }

  function overStop(event: DragEvent, dayNo: number, stopId: number) {
    if (dragId === null) return;
    event.preventDefault();
    event.stopPropagation();
    if (stopId === dragId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    const day = orderRef.current.find((d) => d.day_no === dayNo);
    if (!day) return;
    const rest = day.stops.filter((stop) => stop.item_id !== dragId);
    const index = rest.findIndex((stop) => stop.item_id === stopId);
    update(moveStop(orderRef.current, dragId, dayNo, after ? index + 1 : index));
  }

  function overDay(event: DragEvent, dayNo: number) {
    if (dragId === null || dayNo > totalDays) return;
    event.preventDefault();
    const day = orderRef.current.find((d) => d.day_no === dayNo);
    if (!day || day.stops.some((stop) => stop.item_id === dragId)) return;
    const rest = day.stops.filter((stop) => stop.item_id !== dragId);
    update(moveStop(orderRef.current, dragId, dayNo, rest.length));
  }

  async function finishDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragId(null);
    const next = orderRef.current;
    if (orderKey(next) === orderKey(days)) return;
    setSaving(true);
    setError("");
    const result = await sendJson("PUT", `/api/schedules/${scheduleId}/items/order`, {
      days: next
        .filter((day) => day.day_no <= totalDays)
        .map((day) => ({ day_no: day.day_no, item_ids: day.stops.map((stop) => stop.item_id) })),
    });
    setSaving(false);
    if (!result.ok) {
      orderRef.current = days;
      setOrder(days);
      return setError(result.data.message ?? "Couldn't save the new order.");
    }
    router.refresh();
  }

  finishRef.current = finishDrag;

  async function remove(itemId: number) {
    setPendingRemove(null);
    setBusyId(itemId);
    setError("");
    const result = await sendJson("DELETE", `/api/schedules/${scheduleId}/items/${itemId}`);
    setBusyId(null);
    if (!result.ok) return setError(result.data.message ?? "Couldn't remove this place.");
    router.refresh();
  }

  return (
    <div className={`day-list ${saving ? "is-saving" : ""}`}>
      {error && <p className="form-error" role="alert">{error}</p>}
      {canEdit && <p className="drag-hint">Drag a place to change the order or move it to another day.</p>}
      {order.flatMap((day) => {
        const dropOnDay = {
          onDragOver: (event: DragEvent) => overDay(event, day.day_no),
          onDrop: (event: DragEvent) => event.preventDefault(),
        };
        return [
          <div key={`day-${day.day_no}`} id={`day-${day.day_no}`} className="day-divider" {...dropOnDay}>
            DAY {day.day_no}
          </div>,
          day.stops.length === 0 ? (
            <p key={`empty-${day.day_no}`} className={`day-empty ${dragId !== null ? "drop-zone" : ""}`} {...dropOnDay}>
              {dragId !== null ? "Drop here" : "No places yet."}
            </p>
          ) : null,
          ...day.stops.map((stop) => (
            <div
              key={`stop-${stop.item_id}`}
              className={`stop-row ${busyId === stop.item_id ? "is-busy" : ""} ${dragId === stop.item_id ? "is-dragging" : ""}`}
              draggable={canEdit && !saving}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(stop.item_id));
                draggingRef.current = true;
                setDragId(stop.item_id);
              }}
              onDragOver={(event) => overStop(event, day.day_no, stop.item_id)}
              onDrop={(event) => event.preventDefault()}
              onDragEnd={finishDrag}
            >
              {canEdit && <span className="drag-handle" aria-hidden>⋮⋮</span>}
              <div
                className={`stop-thumb ${stop.location.image_url ? "" : "cover-x"}`}
                style={
                  stop.location.image_url
                    ? { backgroundImage: `url(${stop.location.image_url})`, backgroundSize: "cover" }
                    : { backgroundColor: TINTS[stop.item_id % TINTS.length] }
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
                  onClick={() => setPendingRemove({ itemId: stop.item_id, name: stop.location.name })}
                >
                  ×
                </button>
              )}
            </div>
          )),
          canEdit && day.day_no <= totalDays ? (
            <button
              key={`add-${day.day_no}`}
              type="button"
              className="add-place-btn"
              onClick={() => setAddDay(day.day_no)}
              {...dropOnDay}
            >
              + Add plan
            </button>
          ) : null,
        ];
      })}
      {pendingRemove && (
        <ConfirmDialog
          title="Remove this place?"
          message={`"${pendingRemove.name}" will be removed from this plan.`}
          confirmLabel="Remove"
          onCancel={() => setPendingRemove(null)}
          onConfirm={() => remove(pendingRemove.itemId)}
        />
      )}
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
