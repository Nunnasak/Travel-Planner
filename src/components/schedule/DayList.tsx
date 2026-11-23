"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import CoverImage from "@/components/ui/cover-image";
import { sendJson } from "@/lib/api-client";
import { TINTS, tintClass } from "@/lib/categories";
import { placeLine } from "@/lib/place";
import { formatVisitTime, type ScheduleDay, type ScheduleStop } from "@/lib/schedule";
import AddPlaceModal from "./AddPlaceModal";
import StopTime from "./StopTime";

function orderKey(days: ScheduleDay[]) {
  return days.map((day) => `${day.day_no}:${day.stops.map((s) => s.item_id).join(",")}`).join("|");
}

function sortByTime(stops: ScheduleStop[]) {
  return stops
    .map((stop, index) => ({ stop, index }))
    .sort((a, b) => formatVisitTime(a.stop.visit_time).localeCompare(formatVisitTime(b.stop.visit_time)) || a.index - b.index)
    .map(({ stop }) => stop);
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
  const [editingTime, setEditingTime] = useState<number | null>(null);
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
      return setError(result.data.message ?? "บันทึกลำดับใหม่ไม่สำเร็จ ลองอีกครั้ง");
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
    if (!result.ok) return setError(result.data.message ?? "ลบสถานที่ไม่สำเร็จ ลองอีกครั้ง");
    router.refresh();
  }

  async function saveTime(itemId: number, time: string) {
    setError("");
    const result = await sendJson("PATCH", `/api/schedules/${scheduleId}/items/${itemId}`, { visit_time: time });
    if (!result.ok) return result.data.errors?.visit_time ?? result.data.message ?? "แก้เวลาไม่สำเร็จ ลองอีกครั้ง";
    const next = orderRef.current.map((day) => {
      if (!day.stops.some((stop) => stop.item_id === itemId)) return day;
      const stops = day.stops.map((stop) => (stop.item_id === itemId ? { ...stop, visit_time: time } : stop));
      return { ...day, stops: sortByTime(stops) };
    });
    orderRef.current = next;
    setOrder(next);
    router.refresh();
    return null;
  }

  return (
    <div className={`day-list ${saving ? "is-saving" : ""}`}>
      {error && <p className="form-error" role="alert">{error}</p>}
      {canEdit && <p className="drag-hint">ลากสถานที่เพื่อเปลี่ยนลำดับ หรือย้ายไปวันอื่น กดที่เวลาเพื่อแก้ไข</p>}
      {order.flatMap((day) => {
        const dropOnDay = {
          onDragOver: (event: DragEvent) => overDay(event, day.day_no),
          onDrop: (event: DragEvent) => event.preventDefault(),
        };
        return [
          <div key={`day-${day.day_no}`} id={`day-${day.day_no}`} className="day-divider" {...dropOnDay}>
            วันที่ {day.day_no}
          </div>,
          day.stops.length === 0 ? (
            <p key={`empty-${day.day_no}`} className={`day-empty ${dragId !== null ? "drop-zone" : ""}`} {...dropOnDay}>
              {dragId !== null ? "วางที่นี่" : "ยังไม่มีสถานที่"}
            </p>
          ) : null,
          ...day.stops.map((stop, index) => (
            <div
              key={`stop-${stop.item_id}`}
              className={`stop-row ${index === day.stops.length - 1 ? "is-last" : ""} ${busyId === stop.item_id ? "is-busy" : ""} ${dragId === stop.item_id ? "is-dragging" : ""}`}
              draggable={canEdit && !saving && editingTime !== stop.item_id}
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
              <StopTime
                value={stop.visit_time}
                placeName={stop.location.name}
                editable={canEdit && !saving}
                outOfOrder={
                  index > 0 &&
                  formatVisitTime(stop.visit_time) < formatVisitTime(day.stops[index - 1].visit_time)
                }
                onEditingChange={(editing) => setEditingTime(editing ? stop.item_id : null)}
                onSave={(time) => saveTime(stop.item_id, time)}
              />
              <span className="stop-ring" aria-hidden="true">{index + 1}</span>
              <div
                className={`stop-thumb ${
                  stop.location.image_url ? "" : `cover-x ${tintClass(TINTS[stop.item_id % TINTS.length])}`
                }`}
              >
                {stop.location.image_url ? (
                  <CoverImage src={stop.location.image_url} alt={stop.location.name} sizes="60px" />
                ) : (
                  <span className="cover-badge">ไม่มีรูป</span>
                )}
              </div>
              <div className="stop-info">
                <strong>{stop.location.name}</strong>
                <span>{placeLine(stop.location)}</span>
              </div>
              {canEdit && <span className="drag-handle" aria-hidden>⋮⋮</span>}
              {canEdit && (
                <button
                  type="button"
                  className="stop-remove"
                  aria-label={`ลบ ${stop.location.name}`}
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
              <span className="add-place-ring" aria-hidden="true">+</span>
              เพิ่มสถานที่ในวันที่ {day.day_no}
            </button>
          ) : null,
        ];
      })}
      {pendingRemove && (
        <ConfirmDialog
          title="ลบสถานที่นี้ไหม?"
          message={`"${pendingRemove.name}" จะถูกลบออกจากแผนนี้`}
          confirmLabel="ลบสถานที่"
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
