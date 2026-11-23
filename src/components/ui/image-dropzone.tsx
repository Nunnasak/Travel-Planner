"use client";
import { useId, useRef, useState, type DragEvent } from "react";
import { uploadImage } from "@/lib/api-client";
import { NETWORK_ERROR } from "@/lib/messages";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  onUploaded: (url: string) => void;
  disabled?: boolean;
  compact?: boolean;
};

export default function ImageDropzone({ onUploaded, disabled, compact }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function send(file: File | undefined) {
    setError("");
    setDone("");
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError("อัปโหลดได้เฉพาะรูป JPG, PNG หรือ WebP");
    if (file.size > MAX_BYTES) return setError("รูปต้องมีขนาดไม่เกิน 5 MB");

    setBusy(true);
    try {
      const result = await uploadImage(file);
      if (!result.ok) {
        setError(result.data.errors?.file ?? result.data.message ?? "อัปโหลดรูปไม่สำเร็จ ลองอีกครั้ง");
        return;
      }
      setDone(file.name);
      onUploaded(String(result.data.url));
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled && !busy) send(event.dataTransfer.files[0]);
  }

  return (
    <div className="dropzone-wrap">
      <label
        htmlFor={inputId}
        className={`dropzone ${compact ? "is-compact" : ""} ${dragging ? "is-dragging" : ""} ${busy ? "is-busy" : ""}`}
        aria-disabled={disabled || busy || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        <span className="dropzone-text">
          <strong>{busy ? "กำลังอัปโหลด…" : "อัปโหลดรูป"}</strong>
          {!compact && <span>ลากไฟล์มาวาง หรือคลิกเพื่อเลือก รองรับ JPG, PNG, WebP ไม่เกิน 5 MB</span>}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={TYPES.join(",")}
          className="dropzone-input"
          disabled={disabled || busy}
          onChange={(event) => send(event.target.files?.[0])}
        />
      </label>
      {error && <p className="field-error" role="alert">{error}</p>}
      {done && !error && <p className="dropzone-done" role="status">อัปโหลด {done} แล้ว</p>}
    </div>
  );
}
