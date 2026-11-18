"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { CATEGORY_KEYS, categoryInfo } from "@/lib/categories";
import { pickFieldErrors, sendJson } from "@/lib/api-client";

const FIELDS = ["schedule_name", "description", "total_day", "category", "cover_url"] as const;
type Field = (typeof FIELDS)[number];

export type ScheduleFormValues = {
  schedule_name: string;
  description: string;
  total_day: number;
  category: string;
  cover_url: string;
  is_public: boolean;
};

const EMPTY: ScheduleFormValues = {
  schedule_name: "",
  description: "",
  total_day: 1,
  category: "",
  cover_url: "",
  is_public: false,
};

type Props = {
  scheduleId?: number;
  initial?: ScheduleFormValues;
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function ScheduleForm({ scheduleId, initial = EMPTY, onSaved, onCancel }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = scheduleId !== undefined;

  function set<K extends keyof ScheduleFormValues>(key: K, value: ScheduleFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const next: Partial<Record<Field, string>> = {};
    if (!values.schedule_name.trim()) next.schedule_name = "Enter a plan name.";
    if (!values.category) next.category = "Pick a category.";
    if (!(values.total_day >= 1)) next.total_day = "A plan needs at least 1 day.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const result = editing
        ? await sendJson("PATCH", `/api/schedules/${scheduleId}`, values)
        : await sendJson("POST", "/api/schedules", values);

      if (result.ok) {
        if (onSaved) {
          onSaved();
          router.refresh();
        } else {
          router.push(`/schedules/${result.data.schedule_id}`);
        }
        setSaving(false);
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
    <form className="schedule-form" onSubmit={submit} noValidate>
      <Input
        label="Plan name"
        name="schedule_name"
        placeholder="Bangkok Weekend Trip"
        value={values.schedule_name}
        onChange={(e) => set("schedule_name", e.target.value)}
        error={errors.schedule_name}
      />

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={4}
          placeholder="Write here…"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          aria-invalid={errors.description ? true : undefined}
        />
        {errors.description && <p className="field-error">{errors.description}</p>}
      </div>

      <div className="form-row">
        <Input
          label="Days"
          name="total_day"
          type="number"
          min={1}
          max={30}
          value={values.total_day}
          onChange={(e) => set("total_day", Number(e.target.value))}
          error={errors.total_day}
        />
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="select"
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
            aria-invalid={errors.category ? true : undefined}
          >
            <option value="">Select category</option>
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>{categoryInfo(key).label}</option>
            ))}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>
      </div>

      <Input
        label="Cover image URL (optional)"
        name="cover_url"
        type="url"
        placeholder="https://..."
        value={values.cover_url}
        onChange={(e) => set("cover_url", e.target.value)}
        error={errors.cover_url}
      />

      <label className="check-row">
        <input
          type="checkbox"
          className="check"
          checked={values.is_public}
          onChange={(e) => set("is_public", e.target.checked)}
        />
        Show this plan on Discover
      </label>

      {formError && <p className="form-error" role="alert">{formError}</p>}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-outline" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-coral" disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Create plan"}
        </button>
      </div>
    </form>
  );
}
