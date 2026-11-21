"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/api-client";
import CategoryTags from "@/components/ui/category-tags";
import { coverTintClass } from "@/lib/categories";
import type { ScheduleDetail } from "@/lib/schedule";
import DayList from "./DayList";
import RouteMap from "./RouteMap";
import ScheduleForm from "./ScheduleForm";

export default function ScheduleEditor({ plan }: { plan: ScheduleDetail }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function togglePublic() {
    setBusy(true);
    setError("");
    setNotice("");
    const result = await sendJson("PATCH", `/api/schedules/${plan.schedule_id}`, {
      is_public: !plan.is_public,
    });
    setBusy(false);
    if (!result.ok) return setError(result.data.message ?? "Couldn't update the plan.");
    setNotice(plan.is_public ? "The plan is private now." : "The plan is on Discover now.");
    router.refresh();
  }

  async function share() {
    setError("");
    if (!plan.is_public) {
      return setNotice("Post the plan first so other people can open the link.");
    }
    const link = `${window.location.origin}/discover/${plan.schedule_id}`;
    try {
      await navigator.clipboard.writeText(link);
      setNotice("Link copied.");
    } catch {
      setNotice(link);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${plan.schedule_name}"? This can't be undone.`)) return;
    setBusy(true);
    setError("");
    const result = await sendJson("DELETE", `/api/schedules/${plan.schedule_id}`);
    if (!result.ok) {
      setBusy(false);
      return setError(result.data.message ?? "Couldn't delete this plan.");
    }
    router.push("/schedules");
    router.refresh();
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{plan.schedule_name}</h1>
        <div className="header-actions">
          {plan.can_edit && !editing && (
            <button type="button" className="btn-outline" onClick={() => { setEditing(true); setNotice(""); setError(""); }} disabled={busy}>
              Edit
            </button>
          )}
          {plan.access === "owner" && (
            <button type="button" className="btn-outline danger" onClick={remove} disabled={busy}>
              Delete
            </button>
          )}
          {plan.can_edit && (
            <button type="button" className="btn-coral" onClick={togglePublic} disabled={busy}>
              {plan.is_public ? "UNPOST" : "POST"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}

      {editing ? (
        <div className="form-page">
          <ScheduleForm
            scheduleId={plan.schedule_id}
            initial={{
              schedule_name: plan.schedule_name,
              description: plan.description ?? "",
              total_day: plan.total_day,
              categories: plan.categories,
              cover_url: plan.cover_url ?? "",
              is_public: plan.is_public,
            }}
            onSaved={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="detail-grid">
          <aside className="detail-side">
            <div
              className={`detail-cover ${plan.cover_url ? "" : `cover-x ${coverTintClass(plan.categories)}`}`}
              style={plan.cover_url ? { backgroundImage: `url(${plan.cover_url})` } : undefined}
            >
              {!plan.cover_url && <span className="cover-badge">IMG</span>}
            </div>
            <h2>Description</h2>
            <p className="detail-desc">{plan.description || "No description yet."}</p>
            <h2>Category</h2>
            <CategoryTags categories={plan.categories} className="tag-list" />
            <p className="plan-meta">
              {plan.total_day} {plan.total_day === 1 ? "day" : "days"} · {plan.is_public ? "Public" : "Private"}
              {plan.access !== "owner" && ` · by ${plan.owner.username}`}
            </p>
            <h2>Map</h2>
            <RouteMap days={plan.days} />
          </aside>

          <section className="detail-plan">
            <div className="plan-head">
              <h2>Plan</h2>
              <button type="button" className="btn-outline small" onClick={share}>Share</button>
            </div>
            <DayList
              scheduleId={plan.schedule_id}
              totalDays={plan.total_day}
              days={plan.days}
              canEdit={plan.can_edit}
            />
          </section>
        </div>
      )}
    </div>
  );
}
