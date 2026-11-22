"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import ImageDropzone from "@/components/ui/image-dropzone";
import { UPLOAD_PATH } from "@/core/schema/image.schema";
import { MAX_DAYS } from "@/core/schema/schedule.schema";
import { pickFieldErrors, sendJson } from "@/lib/api-client";
import { CATEGORY_KEYS, categoryInfo, tintClass } from "@/lib/categories";
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

function Section({ step, title, hint, children }: { step: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="create-section" aria-labelledby={`create-step-${step}`}>
      <header className="create-section-head">
        <span className="create-step" aria-hidden="true">{step}</span>
        <div>
          <h2 id={`create-step-${step}`}>{title}</h2>
          {hint && <p>{hint}</p>}
        </div>
      </header>
      {children}
    </section>
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
    if (!values.schedule_name.trim()) next.schedule_name = "Enter a plan name.";
    if (values.categories.length === 0) next.categories = "Pick at least one category.";
    if (!(values.total_day >= 1)) next.total_day = "A plan needs at least 1 day.";
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
        setFormError(result.data.message ?? "Couldn't save the plan. Please try again.");
      }
    } catch {
      setFormError("Cannot reach the server. Check your connection and try again.");
    }
    setSaving(false);
  }

  return (
    <div className="create-layout">
      <form className="create-form" onSubmit={submit} noValidate>
        <Section step={1} title="Name your trip">
          <div className="field">
            <div className="field-label-row">
              <label htmlFor="schedule_name">Plan name</label>
              <span className="field-count">{values.schedule_name.length}/{NAME_MAX}</span>
            </div>
            <input
              id="schedule_name"
              name="schedule_name"
              autoFocus
              maxLength={NAME_MAX}
              placeholder="Bangkok Weekend Trip"
              value={values.schedule_name}
              onChange={(e) => set("schedule_name", e.target.value)}
              aria-invalid={errors.schedule_name ? true : undefined}
            />
            {errors.schedule_name && <p className="field-error">{errors.schedule_name}</p>}
          </div>
          <div className="field">
            <div className="field-label-row">
              <label htmlFor="description">
                Description <span className="field-optional">optional</span>
              </label>
              <span className="field-count">{values.description.length}/{DESCRIPTION_MAX}</span>
            </div>
            <textarea
              id="description"
              rows={4}
              maxLength={DESCRIPTION_MAX}
              placeholder="What is this trip about?"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={errors.description ? true : undefined}
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>
        </Section>

        <Section step={2} title="How long?" hint={`You can change this later, up to ${MAX_DAYS} days.`}>
          <div className="stepper create-days" role="group" aria-label="Number of days">
            <button
              type="button"
              aria-label="One day less"
              disabled={values.total_day <= 1}
              onClick={() => set("total_day", values.total_day - 1)}
            >
              −
            </button>
            <span aria-live="polite">
              {values.total_day} {values.total_day === 1 ? "day" : "days"}
            </span>
            <button
              type="button"
              aria-label="One day more"
              disabled={values.total_day >= MAX_DAYS}
              onClick={() => set("total_day", values.total_day + 1)}
            >
              +
            </button>
          </div>
          {errors.total_day && <p className="field-error">{errors.total_day}</p>}
        </Section>

        <Section step={3} title="What kind of trip?" hint="Pick one or more.">
          <div
            className="category-picker"
            role="group"
            aria-label="Categories"
            aria-invalid={errors.categories ? true : undefined}
          >
            {CATEGORY_KEYS.map((key) => {
              const picked = values.categories.includes(key);
              const info = categoryInfo(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={`category-option ${picked ? "is-checked" : ""}`}
                  aria-pressed={picked}
                  onClick={() => toggleCategory(key)}
                >
                  <span className={`category-dot ${tintClass(info.tint)}`} aria-hidden="true" />
                  {info.label}
                </button>
              );
            })}
          </div>
          {errors.categories && <p className="field-error">{errors.categories}</p>}
        </Section>

        <Section step={4} title="Cover photo" hint="Optional. Upload a photo or paste a link.">
          <div className="field">
            {values.cover_url.startsWith(UPLOAD_PATH) ? (
              <div className="uploaded-row">
                <span>Using your uploaded photo</span>
                <button type="button" className="btn-outline small" onClick={() => set("cover_url", "")}>
                  Remove
                </button>
              </div>
            ) : (
              <>
                <ImageDropzone onUploaded={(url) => set("cover_url", url)} />
                <p className="or-divider">or paste a link</p>
                <input
                  id="cover_url"
                  name="cover_url"
                  type="url"
                  aria-label="Cover image URL"
                  placeholder="https://…"
                  value={values.cover_url}
                  onChange={(e) => set("cover_url", e.target.value)}
                  aria-invalid={errors.cover_url ? true : undefined}
                />
              </>
            )}
            {errors.cover_url && <p className="field-error">{errors.cover_url}</p>}
            {!errors.cover_url && coverUrl && coverUrl === brokenCover && (
              <p className="field-error">Couldn&apos;t load this image. Check the link.</p>
            )}
          </div>
        </Section>

        {formError && <p className="form-error" role="alert">{formError}</p>}

        <div className="create-actions">
          <Link href="/schedules" className="btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn-coral" disabled={saving}>
            {saving ? "Creating…" : "Create plan"}
          </button>
        </div>
      </form>

      <aside className="create-preview" aria-label="Preview">
        <h2>Preview</h2>
        <PlanCardPreview
          name={values.schedule_name}
          description={values.description}
          days={values.total_day}
          categories={values.categories}
          coverUrl={previewCover}
          onCoverError={() => coverUrl && setBrokenCover(coverUrl)}
        />
        <p>This is how the plan will look in My Schedule. You&apos;ll add places on the next page.</p>
      </aside>
    </div>
  );
}
