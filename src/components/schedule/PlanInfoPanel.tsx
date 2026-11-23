"use client";
import { useEffect, useState } from "react";
import CategoryTags from "@/components/ui/category-tags";
import CoverImage from "@/components/ui/cover-image";
import ImageDropzone from "@/components/ui/image-dropzone";
import { MAX_DAYS } from "@/core/schema/schedule.schema";
import { CATEGORY_KEYS, categoryInfo, coverTintClass } from "@/lib/categories";
import type { ScheduleDetail } from "@/lib/schedule";
import type { PlanPatch } from "./usePlanPatch";

type Props = {
  plan: ScheduleDetail;
  onSave: (patch: PlanPatch) => Promise<boolean>;
};

function metaLine(plan: ScheduleDetail, days: number) {
  const parts = [`${days} วัน`, plan.post ? "โพสต์ในหน้าสำรวจทริปแล้ว" : "ส่วนตัว"];
  if (plan.member_count > 0) {
    parts.push(`แชร์กับ ${plan.member_count} คน`);
  }
  if (plan.access !== "owner") parts.push(`โดย ${plan.owner.username}`);
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

  function cancelCover() {
    setCoverDraft(plan.cover_url ?? "");
    setCoverOpen(false);
  }

  async function saveCover(value: string | null) {
    const next = value?.trim() || null;
    setCoverOpen(false);
    if (next === (plan.cover_url ?? null)) return;
    if (!(await onSave({ cover_url: next }))) setCoverDraft(plan.cover_url ?? "");
  }

  return (
    <aside className="detail-side">
      <div className={`detail-cover ${plan.cover_url ? "" : `cover-x ${coverTintClass(plan.categories)}`}`}>
        {plan.cover_url ? (
          <CoverImage src={plan.cover_url} alt={plan.schedule_name} sizes="240px" eager />
        ) : (
          <span className="cover-badge">ไม่มีรูป</span>
        )}
        {editable && !coverOpen && (
          <span className="cover-actions">
            <button type="button" className="cover-action" onClick={() => setCoverOpen(true)}>
              {plan.cover_url ? "เปลี่ยนรูปปก" : "เพิ่มรูปปก"}
            </button>
            {plan.cover_url && (
              <button type="button" className="cover-action" onClick={() => saveCover(null)}>
                ลบรูป
              </button>
            )}
          </span>
        )}
      </div>
      {editable && coverOpen && (
        <div className="cover-editor">
          <ImageDropzone compact onUploaded={(url) => saveCover(url)} />
          <div className="cover-link-row">
            <input
              className="inline-field"
              type="url"
              placeholder="หรือวางลิงก์รูป (https://…)"
              aria-label="ลิงก์รูปปก"
              value={coverDraft}
              onChange={(e) => setCoverDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveCover(coverDraft);
                if (e.key === "Escape") cancelCover();
              }}
            />
            <button type="button" className="btn-outline small" onClick={() => saveCover(coverDraft)}>
              ใช้ลิงก์นี้
            </button>
          </div>
          <button type="button" className="cover-cancel" onClick={cancelCover}>
            ยกเลิก
          </button>
        </div>
      )}

      <h2>รายละเอียด</h2>
      {editable ? (
        <textarea
          className="inline-field inline-text"
          placeholder="เขียนรายละเอียดทริป…"
          aria-label="รายละเอียด"
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveDescription}
        />
      ) : (
        <p className="detail-desc">{plan.description || "ยังไม่มีคำอธิบาย"}</p>
      )}

      <h2>หมวดหมู่</h2>
      {editable ? (
        <div className="category-picker" role="group" aria-label="หมวดหมู่">
          {CATEGORY_KEYS.map((key) => {
            const picked = categories.includes(key);
            const last = picked && categories.length === 1;
            return (
              <button
                key={key}
                type="button"
                className={`category-option ${picked ? "is-checked" : ""}`}
                aria-pressed={picked}
                title={last ? "แผนต้องมีอย่างน้อย 1 หมวดหมู่" : undefined}
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
          <h2>จำนวนวัน</h2>
          <div className="stepper days-stepper">
            <button type="button" aria-label="ลดหนึ่งวัน" disabled={days <= 1} onClick={() => changeDays(days - 1)}>
              −
            </button>
            <span aria-live="polite">
              {days} วัน
            </span>
            <button
              type="button"
              aria-label="เพิ่มหนึ่งวัน"
              disabled={days >= MAX_DAYS}
              onClick={() => changeDays(days + 1)}
            >
              +
            </button>
          </div>
        </>
      )}

      <p className="plan-meta">{metaLine(plan, days)}</p>
    </aside>
  );
}
