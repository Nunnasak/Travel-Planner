"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import TicketCard from "@/components/ui/ticket-card";
import { sendJson } from "@/lib/api-client";
import { NETWORK_ERROR } from "@/lib/messages";
import type { MySchedule } from "@/lib/schedule";
import ShareDialog from "./ShareDialog";

type Confirming = "delete" | "leave" | "post" | null;

type Props = { plan: MySchedule; currentUserId: number; eager?: boolean };

export default function ScheduleCard({ plan, currentUserId, eager = false }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [sharing, setSharing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const base = `/api/schedules/${plan.schedule_id}`;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(action: () => void) {
    setOpen(false);
    setError("");
    setNotice("");
    action();
  }

  async function run(method: "POST" | "DELETE", url: string, fallback: string) {
    setConfirming(null);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await sendJson(method, url);
      if (!result.ok) {
        setError(result.data.message ?? fallback);
        return null;
      }
      return result;
    } catch {
      setError(NETWORK_ERROR);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    const result = await run("POST", `${base}/copy`, "ทำสำเนาไม่สำเร็จ ลองอีกครั้ง");
    if (result) router.push(`/schedules/${result.data.schedule_id}`);
  }

  async function post() {
    const result = await run("POST", `${base}/post`, "โพสต์ไม่สำเร็จ ลองอีกครั้ง");
    if (!result) return;
    setNotice(plan.post ? "อัปเดตโพสต์แล้ว" : "โพสต์ลงหน้าสำรวจทริปแล้ว");
    router.refresh();
  }

  async function remove() {
    if (await run("DELETE", base, "ลบแผนไม่สำเร็จ ลองอีกครั้ง")) router.refresh();
  }

  async function leave() {
    if (await run("DELETE", `${base}/members/${currentUserId}`, "ออกจากแผนไม่สำเร็จ ลองอีกครั้ง")) router.refresh();
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
          aria-label={`ตัวเลือกของแผน ${plan.schedule_name}`}
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={busy}
          onClick={() => setOpen((value) => !value)}
        >
          •••
        </button>
        {open && (
          <div className="card-menu-list" role="menu">
            {plan.is_owner && (
              <button type="button" role="menuitem" onClick={() => choose(() => setSharing(true))}>
                แชร์…
              </button>
            )}
            <button type="button" role="menuitem" onClick={() => choose(copy)}>
              ทำสำเนา
            </button>
            {plan.is_owner && plan.post && (
              <>
                <button type="button" role="menuitem" onClick={() => choose(post)}>
                  อัปเดตโพสต์
                </button>
                <Link href={`/discover/${plan.post.schedule_id}`} role="menuitem" onClick={() => setOpen(false)}>
                  ดูโพสต์
                </Link>
              </>
            )}
            {plan.is_owner && !plan.post && (
              <button type="button" role="menuitem" onClick={() => choose(() => setConfirming("post"))}>
                โพสต์ลงหน้าสำรวจทริป
              </button>
            )}
            <hr className="card-menu-sep" />
            {plan.is_owner ? (
              <button type="button" role="menuitem" className="danger" onClick={() => choose(() => setConfirming("delete"))}>
                ลบแผน
              </button>
            ) : (
              <button type="button" role="menuitem" className="danger" onClick={() => choose(() => setConfirming("leave"))}>
                ออกจากแผน
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p className="field-error card-error" role="alert">{error}</p>}
      {notice && <p className="card-notice" role="status">{notice}</p>}
      {confirming === "delete" && (
        <ConfirmDialog
          title="ลบแผนนี้ไหม?"
          message={`แผน "${plan.schedule_name}"${plan.post ? " และโพสต์ในหน้าสำรวจทริป" : ""} จะถูกลบ และกู้คืนไม่ได้`}
          confirmLabel="ลบแผน"
          onCancel={() => setConfirming(null)}
          onConfirm={remove}
        />
      )}
      {confirming === "leave" && (
        <ConfirmDialog
          title="ออกจากแผนนี้ไหม?"
          message={`แผน "${plan.schedule_name}" จะหายไปจากแผนของคุณ ถ้าจะกลับมาอีก ต้องให้เจ้าของแผนเพิ่มคุณใหม่`}
          confirmLabel="ออกจากแผน"
          onCancel={() => setConfirming(null)}
          onConfirm={leave}
        />
      )}
      {confirming === "post" && (
        <ConfirmDialog
          title="โพสต์แผนนี้ไหม?"
          message="ทุกคนจะเห็นสำเนาของแผนตามที่เป็นอยู่ตอนนี้ในหน้าสำรวจทริป และคัดลอกไปใช้ได้ แก้แผนทีหลังแล้วค่อยอัปเดตโพสต์ได้"
          confirmLabel="โพสต์"
          onCancel={() => setConfirming(null)}
          onConfirm={post}
        />
      )}
      {sharing && createPortal(<ShareDialog scheduleId={plan.schedule_id} onClose={() => setSharing(false)} />, document.body)}
    </TicketCard>
  );
}
