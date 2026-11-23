"use client";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { formatVisitTime, parseTimeInput } from "@/lib/schedule";

const BAD_TIME = "ใส่เวลาแบบ 09:30 (00:00–23:59)";
const OUT_OF_ORDER = "เวลานี้เร็วกว่าสถานที่ก่อนหน้า";

type Props = {
  value: string | null;
  placeName: string;
  editable: boolean;
  outOfOrder: boolean;
  onEditingChange: (editing: boolean) => void;
  onSave: (time: string) => Promise<string | null>;
};

export default function StopTime({ value, placeName, editable, outOfOrder, onEditingChange, onSave }: Props) {
  const shown = formatVisitTime(value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const busy = useRef(false);
  const errorId = useId();

  const warning = outOfOrder ? OUT_OF_ORDER : undefined;

  if (!editable) {
    return (
      <span className={`stop-time ${outOfOrder ? "is-out-of-order" : ""}`} title={warning}>
        {shown}
      </span>
    );
  }

  function open() {
    setDraft(shown === "--:--" ? "" : shown);
    setError("");
    setEditing(true);
    onEditingChange(true);
  }

  function close() {
    setEditing(false);
    setError("");
    onEditingChange(false);
  }

  async function commit() {
    if (busy.current) return;
    const next = parseTimeInput(draft);
    if (!next) return setError(BAD_TIME);
    if (next === shown) return close();
    busy.current = true;
    const failed = await onSave(next);
    busy.current = false;
    if (failed) return setError(failed);
    close();
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={`stop-time stop-time-edit ${outOfOrder ? "is-out-of-order" : ""}`}
        title={warning ? `${warning} กดเพื่อแก้เวลา` : "กดเพื่อแก้เวลา"}
        aria-label={`แก้เวลาของ ${placeName} ตอนนี้ ${shown}${warning ? ` ${warning}` : ""}`}
        onClick={open}
      >
        {shown}
      </button>
    );
  }

  return (
    <span className="stop-time stop-time-editing">
      <input
        className="stop-time-input"
        autoFocus
        value={draft}
        inputMode="numeric"
        maxLength={5}
        placeholder="09:30"
        aria-label={`เวลาของ ${placeName}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          setDraft(event.target.value);
          setError("");
        }}
        onKeyDown={onKey}
        onBlur={() => void commit()}
      />
      {error && (
        <span className="stop-time-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
