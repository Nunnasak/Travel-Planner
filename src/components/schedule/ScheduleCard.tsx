"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import TicketCard from "@/components/ui/ticket-card";
import { toThai } from "@/lib/messages";
import type { MySchedule } from "@/lib/schedule";

export default function ScheduleCard({ plan, eager = false }: { plan: MySchedule; eager?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  async function remove() {
    setConfirming(false);
    setBusy(true);
    setError("");
    const res = await fetch(`/api/schedules/${plan.schedule_id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(toThai(data.message) ?? "ลบแผนไม่สำเร็จ ลองอีกครั้ง");
    }
    router.refresh();
  }

  return (
    <TicketCard
      className={`schedule-card ${busy ? "is-busy" : ""}`}
      href={`/schedules/${plan.schedule_id}`}
      title={plan.schedule_name}
      subtitle={plan.description || "ยังไม่มีคำอธิบาย"}
      coverUrl={plan.cover_url}
      categories={plan.categories}
      days={plan.total_day}
      placeCount={plan.place_count}
      badges={[...(plan.post ? ["โพสต์แล้ว"] : []), ...(plan.is_owner ? [] : ["แชร์มาให้คุณ"])]}
      eager={eager}
    >
      <div className="card-menu" ref={menuRef}>
        <button
          type="button"
          className="card-menu-btn"
          aria-label="ตัวเลือกของแผน"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          •••
        </button>
        {open && (
          <div className="card-menu-list" role="menu">
            <Link href={`/schedules/${plan.schedule_id}`} role="menuitem">เปิดแผน</Link>
            {plan.is_owner && (
              <button
                type="button"
                role="menuitem"
                className="danger"
                onClick={() => {
                  setOpen(false);
                  setConfirming(true);
                }}
              >
                ลบแผน
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p className="field-error card-error">{error}</p>}
      {confirming && (
        <ConfirmDialog
          title="ลบแผนนี้ไหม?"
          message={`แผน "${plan.schedule_name}"${plan.post ? " และโพสต์ในหน้าสำรวจทริป" : ""} จะถูกลบ และกู้คืนไม่ได้`}
          confirmLabel="ลบแผน"
          onCancel={() => setConfirming(false)}
          onConfirm={remove}
        />
      )}
    </TicketCard>
  );
}
