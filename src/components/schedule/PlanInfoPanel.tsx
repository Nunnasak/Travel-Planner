"use client";
import { useEffect, useState } from "react";
import CategoryTags from "@/components/ui/category-tags";
import { MAX_DAYS } from "@/core/schema/schedule.schema";
import { CATEGORY_KEYS, categoryInfo, coverTintClass } from "@/lib/categories";
import type { ScheduleDetail } from "@/lib/schedule";
import RouteMap from "./RouteMap";
import type { PlanPatch } from "./usePlanPatch";

type Props = {
  plan: ScheduleDetail;
  onSave: (patch: PlanPatch) => Promise<boolean>;
};

function metaLine(plan: ScheduleDetail, days: number) {
  const parts = [`${days} ${days === 1 ? "day" : "days"}`, plan.post ? "Posted on Discover" : "Private"];
  if (plan.member_count > 0) {
    parts.push(`Shared with ${plan.member_count} ${plan.member_count === 1 ? "person" : "people"}`);
  }
  if (plan.access !== "owner") parts.push(`by ${plan.owner.username}`);
  return parts.join(" · ");
}

export default function PlanInfoPanel({ plan, onSave }: Props) {
  const editable = plan.can_edit;
  const [description, setDescription] = useState(plan.description ?? "");
  const [categories, setCategories] = useState<string[]>(plan.categories);
  const [days, setDays] = useState(plan.total_day);
  const [coverOpen, setCoverOpen] = useState(false);
  const [coverDraft, setCoverDraft] = useState(plan.cover_url ?? "");

  useEffect(() => setDescription(plan.description ?? ""), [plan.description]);
  useEffect(() => setCategories(plan.categories), [plan.categories]);
  useEffect(() => setDays(plan.total_day), [plan.total_day]);
  useEffect(() => setCoverDraft(plan.cover_url ?? ""), [plan.cover_url]);

  async function saveDescription() {
    const next = description.trim();
    if (next === (plan.description ?? "")) return;
    if (!(await onSave({ description: next || null }))) setDescription(plan.description ?? "");
  }

  async function toggleCategory(key: string) {
    const next = categories.includes(key) ? categories.filter((k) => k !== key) : [...categories, key];
    if (next.length === 0) return;
    setCategories(next);
    if (!(await onSave({ categories: next }))) setCategories(plan.categories);
  }

  async function changeDays(next: number) {
    if (next < 1 || next > MAX_DAYS) return;
    setDays(next);
    if (!(await onSave({ total_day: next }))) setDays(plan.total_day);
  }

  async function saveCover(value: string | null) {
    const next = value?.trim() || null;
    setCoverOpen(false);
    if (next === (plan.cover_url ?? null)) return;
    if (!(await onSave({ cover_url: next }))) setCoverDraft(plan.cover_url ?? "");
  }

  return (
    <aside className="detail-side">
      <div
        className={`detail-cover ${plan.cover_url ? "" : `cover-x ${coverTintClass(plan.categories)}`}`}
        style={plan.cover_url ? { backgroundImage: `url(${plan.cover_url})` } : undefined}
      >
        {!plan.cover_url && <span className="cover-badge">IMG</span>}
        {editable && !coverOpen && (
          <span className="cover-actions">
            <button type="button" className="cover-action" onClick={() => setCoverOpen(true)}>
              {plan.cover_url ? "Change cover" : "Add cover"}
            </button>
            {plan.cover_url && (
              <button type="button" className="cover-action" onClick={() => saveCover(null)}>
                Remove
              </button>
            )}
          </span>
        )}
      </div>
      {editable && coverOpen && (
        <input
          className="inline-field"
          type="url"
          autoFocus
          placeholder="Paste an image URL (https://…)"
          aria-label="Cover image URL"
          value={coverDraft}
          onChange={(e) => setCoverDraft(e.target.value)}
          onBlur={() => saveCover(coverDraft)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setCoverDraft(plan.cover_url ?? "");
              setCoverOpen(false);
            }
          }}
        />
      )}

      <h2>Description</h2>
      {editable ? (
        <textarea
          className="inline-field inline-text"
          placeholder="Add a description…"
          aria-label="Description"
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveDescription}
        />
      ) : (
        <p className="detail-desc">{plan.description || "No description yet."}</p>
      )}

      <h2>Category</h2>
      {editable ? (
        <div className="category-picker" role="group" aria-label="Categories">
          {CATEGORY_KEYS.map((key) => {
            const picked = categories.includes(key);
            const last = picked && categories.length === 1;
            return (
              <button
                key={key}
                type="button"
                className={`category-option ${picked ? "is-checked" : ""}`}
                aria-pressed={picked}
                title={last ? "A plan needs at least one category" : undefined}
                onClick={() => toggleCategory(key)}
              >
                {categoryInfo(key).label}
              </button>
            );
          })}
        </div>
      ) : (
        <CategoryTags categories={plan.categories} className="tag-list" />
      )}

      {editable && (
        <>
          <h2>Days</h2>
          <div className="stepper days-stepper">
            <button type="button" aria-label="One day less" disabled={days <= 1} onClick={() => changeDays(days - 1)}>
              −
            </button>
            <span aria-live="polite">
              {days} {days === 1 ? "day" : "days"}
            </span>
            <button
              type="button"
              aria-label="One day more"
              disabled={days >= MAX_DAYS}
              onClick={() => changeDays(days + 1)}
            >
              +
            </button>
          </div>
        </>
      )}

      <p className="plan-meta">{metaLine(plan, days)}</p>
      <h2>Map</h2>
      <RouteMap days={plan.days} />
    </aside>
  );
}
