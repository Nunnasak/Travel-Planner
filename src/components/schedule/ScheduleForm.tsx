"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import ImageDropzone from "@/components/ui/image-dropzone";
import RouteStops from "@/components/ui/route-stops";
import { UPLOAD_PATH } from "@/core/schema/image.schema";
import { MAX_DAYS } from "@/core/schema/schedule.schema";
import { pickFieldErrors, sendJson } from "@/lib/api-client";
import { NETWORK_ERROR } from "@/lib/messages";
import { CATEGORY_KEYS, categoryInfo } from "@/lib/categories";
import PlanCardPreview from "./PlanCardPreview";

const FIELDS = ["schedule_name", "description", "total_day", "categories", "cover_url"] as const;
type Field = (typeof FIELDS)[number];

const NAME_MAX = 100;
const DESCRIPTION_MAX = 1000;

type ScheduleFormValues = {
  schedule_name: string;
  description: string;
  total_day: number;
  categories: string[];
  cover_url: string;
};

const EMPTY: ScheduleFormValues = {
  schedule_name: "",
  description: "",
  total_day: 1,
  categories: [],
  cover_url: "",
};

function previewable(url: string) {
  const value = url.trim();
  if (value.startsWith(UPLOAD_PATH)) return value;
  if (!URL.canParse(value)) return null;
  const { protocol } = new URL(value);
  return protocol === "https:" || protocol === "http:" ? value : null;
}

function Step({ step, title, hint, children }: { step: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <li className="create-step" aria-labelledby={`create-step-${step}`}>
      <span className="create-step-ring" aria-hidden="true">{step}</span>
      <div className="create-step-body">
        <header className="create-step-head">
          <h2 id={`create-step-${step}`}>{title}</h2>
          {hint && <p>{hint}</p>}
        </header>
        {children}
      </div>
    </li>
  );
}

export default function ScheduleForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [brokenCover, setBrokenCover] = useState("");

  const coverUrl = previewable(values.cover_url);
  const previewCover = coverUrl && coverUrl !== brokenCover ? coverUrl : null;

  function set<K extends keyof ScheduleFormValues>(key: K, value: ScheduleFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggleCategory(key: string) {
    set(
      "categories",
      values.categories.includes(key) ? values.categories.filter((k) => k !== key) : [...values.categories, key],
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const next: Partial<Record<Field, string>> = {};
    if (!values.schedule_name.trim()) next.schedule_name = "ตั้งชื่อแผน";
    if (values.categories.length === 0) next.categories = "เลือกอย่างน้อย 1 หมวดหมู่";
    if (!(values.total_day >= 1)) next.total_day = "แผนต้องมีอย่างน้อย 1 วัน";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const result = await sendJson("POST", "/api/schedules", values);

      if (result.ok) {
        router.push(`/schedules/${result.data.schedule_id}`);
        return;
      }
      if (result.status === 401) return router.push("/login");

      const fieldErrors = pickFieldErrors(result.data.errors, FIELDS);
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) {
        setFormError(result.data.message ?? "สร้างแผนไม่สำเร็จ ลองอีกครั้ง");
      }
    } catch {
      setFormError(NETWORK_ERROR);
    }
    setSaving(false);
  }


  return (
    <div className="create-layout">
      <form className="create-form" onSubmit={submit} noValidate>
        <ol className="create-steps">
          <Step step={1} title="ตั้งชื่อทริป">
            <div className="field">
              <div className="field-label-row">
                <label htmlFor="schedule_name">ชื่อแผน</label>
                <span className="field-count">{values.schedule_name.length}/{NAME_MAX}</span>
              </div>
              <input
                id="schedule_name"
                name="schedule_name"
                autoFocus
                maxLength={NAME_MAX}
                placeholder="เที่ยวกรุงเทพฯ สุดสัปดาห์"
                value={values.schedule_name}
                onChange={(e) => set("schedule_name", e.target.value)}
                aria-invalid={errors.schedule_name ? true : undefined}
              />
              {errors.schedule_name && <p className="field-error">{errors.schedule_name}</p>}
            </div>
            <div className="field">
              <div className="field-label-row">
                <label htmlFor="description">
                  รายละเอียด <span className="field-optional">ไม่บังคับ</span>
                </label>
                <span className="field-count">{values.description.length}/{DESCRIPTION_MAX}</span>
              </div>
              <textarea
                id="description"
                rows={3}
                maxLength={DESCRIPTION_MAX}
                placeholder="ทริปนี้ไปทำอะไรบ้าง"
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                aria-invalid={errors.description ? true : undefined}
              />
              {errors.description && <p className="field-error">{errors.description}</p>}
            </div>
          </Step>

          <Step step={2} title="ไปกี่วัน" hint={`แก้ทีหลังได้ สูงสุด ${MAX_DAYS} วัน`}>
            <div className="day-picker" role="group" aria-label="จำนวนวัน">
              <button
                type="button"
                className="day-picker-btn"
                aria-label="ลดหนึ่งวัน"
                disabled={values.total_day <= 1}
                onClick={() => set("total_day", values.total_day - 1)}
              >
                −
              </button>
              <div className="day-picker-view">
                <RouteStops days={values.total_day} />
                <strong aria-live="polite">{values.total_day} วัน</strong>
              </div>
              <button
                type="button"
                className="day-picker-btn"
                aria-label="เพิ่มหนึ่งวัน"
                disabled={values.total_day >= MAX_DAYS}
                onClick={() => set("total_day", values.total_day + 1)}
              >
                +
              </button>
            </div>
            {errors.total_day && <p className="field-error">{errors.total_day}</p>}
          </Step>

          <Step step={3} title="ทริปแบบไหน" hint="เลือกได้มากกว่า 1 แบบ">
            <div
              className="create-chips"
              role="group"
              aria-label="หมวดหมู่"
              aria-invalid={errors.categories ? true : undefined}
            >
              {CATEGORY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="category-chip"
                  aria-pressed={values.categories.includes(key)}
                  onClick={() => toggleCategory(key)}
                >
                  {categoryInfo(key).label}
                </button>
              ))}
            </div>
            {errors.categories && <p className="field-error">{errors.categories}</p>}
          </Step>

          <Step step={4} title="รูปปก" hint="ไม่บังคับ อัปโหลดรูปหรือวางลิงก์รูปก็ได้">
            <div className="field">
              {values.cover_url.startsWith(UPLOAD_PATH) ? (
                <div className="uploaded-row">
                  <span>ใช้รูปที่อัปโหลดแล้ว</span>
                  <button type="button" className="btn-outline small" onClick={() => set("cover_url", "")}>
                    ลบรูป
                  </button>
                </div>
              ) : (
                <div className="cover-inputs">
                  <ImageDropzone compact onUploaded={(url) => set("cover_url", url)} />
                  <input
                    id="cover_url"
                    name="cover_url"
                    type="url"
                    aria-label="ลิงก์รูปปก"
                    placeholder="หรือวางลิงก์รูป https://…"
                    value={values.cover_url}
                    onChange={(e) => set("cover_url", e.target.value)}
                    aria-invalid={errors.cover_url ? true : undefined}
                  />
                </div>
              )}
              {errors.cover_url && <p className="field-error">{errors.cover_url}</p>}
              {!errors.cover_url && coverUrl && coverUrl === brokenCover && (
                <p className="field-error">โหลดรูปจากลิงก์นี้ไม่ได้ ตรวจสอบลิงก์อีกครั้ง</p>
              )}
            </div>
          </Step>

          <li className="create-step is-final">
            <span className="create-step-ring" aria-hidden="true" />
            <div className="create-step-body">
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="create-actions">
                <button type="submit" className="btn-coral" disabled={saving}>
                  {saving ? "กำลังสร้าง…" : "สร้างแผน แล้วไปเพิ่มสถานที่"}
                </button>
                <Link href="/schedules" className="create-cancel">
                  ยกเลิก
                </Link>
              </div>
            </div>
          </li>
        </ol>
      </form>

      <aside className="create-preview" aria-label="ตัวอย่าง">
        <h2>หน้าตาการ์ดในแผนของฉัน</h2>
        <PlanCardPreview
          name={values.schedule_name}
          description={values.description}
          days={values.total_day}
          categories={values.categories}
          coverUrl={previewCover}
          onCoverError={() => coverUrl && setBrokenCover(coverUrl)}
        />
        <p>การ์ดจะเปลี่ยนตามที่คุณกรอก จำนวนจุดแวะจะเพิ่มขึ้นเมื่อเพิ่มสถานที่</p>
        <ol className="create-next" aria-label="หลังจากสร้างแผน">
          <li>
            <span><strong>เพิ่มสถานที่</strong> ลงแต่ละวัน พร้อมเวลาที่จะไปถึง</span>
          </li>
          <li>
            <span><strong>ลากจัดลำดับ</strong> แล้วดูเส้นทางของแต่ละวันบนแผนที่</span>
          </li>
          <li>
            <span><strong>แชร์ให้เพื่อน</strong> ช่วยกันแก้ หรือโพสต์ให้คนอื่นเห็น</span>
          </li>
        </ol>
      </aside>
    </div>
  );
}
