"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CategoryTags from "@/components/ui/category-tags";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import CoverImage, { CARD_IMAGE_SIZES } from "@/components/ui/cover-image";
import { coverTintClass } from "@/lib/categories";
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
      return setError(data.message ?? "Couldn't delete this plan.");
    }
    router.refresh();
  }

  return (
    <article className={`plan-card schedule-card ${busy ? "is-busy" : ""}`}>
      <Link href={`/schedules/${plan.schedule_id}`} className="schedule-card-link">
        <div className={`plan-cover ${plan.cover_url ? "" : `cover-x ${coverTintClass(plan.categories)}`}`}>
          {plan.cover_url ? (
            <CoverImage src={plan.cover_url} alt="" sizes={CARD_IMAGE_SIZES} eager={eager} />
          ) : (
            <span className="cover-badge">IMG</span>
          )}
          <CategoryTags categories={plan.categories} max={2} />
          {plan.post && <span className="tag tag-public">On Discover</span>}
        </div>
        <div className="plan-body">
          <h3>{plan.schedule_name}</h3>
          <p className="plan-desc">{plan.description || "No description yet."}</p>
          <p className="plan-meta">
            {plan.total_day} {plan.total_day === 1 ? "day" : "days"} · {plan.place_count}{" "}
            {plan.place_count === 1 ? "place" : "places"}
          </p>
        </div>
      </Link>

      <div className="card-menu" ref={menuRef}>
        <button
          type="button"
          className="card-menu-btn"
          aria-label="Plan options"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          •••
        </button>
        {open && (
          <div className="card-menu-list" role="menu">
            <Link href={`/schedules/${plan.schedule_id}`} role="menuitem">Open</Link>
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
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p className="field-error card-error">{error}</p>}
      {confirming && (
        <ConfirmDialog
          title="Delete this plan?"
          message={`"${plan.schedule_name}"${plan.post ? " and its post on Discover" : ""} will be deleted. This can't be undone.`}
          confirmLabel="Delete plan"
          onCancel={() => setConfirming(false)}
          onConfirm={remove}
        />
      )}
    </article>
  );
}
