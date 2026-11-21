"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { CATEGORY_KEYS, categoryInfo } from "@/lib/categories";
import { pickFieldErrors, sendJson } from "@/lib/api-client";

const FIELDS = ["schedule_name", "description", "total_day", "categories", "cover_url"] as const;
type Field = (typeof FIELDS)[number];

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

export default function ScheduleForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ScheduleFormValues>(key: K, value: ScheduleFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
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
        <fieldset className="category-picker" aria-invalid={errors.categories ? true : undefined}>
          <legend>Categories (pick one or more)</legend>
          {CATEGORY_KEYS.map((key) => {
            const checked = values.categories.includes(key);
            return (
              <label key={key} className={`category-option ${checked ? "is-checked" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    set(
                      "categories",
                      checked ? values.categories.filter((k) => k !== key) : [...values.categories, key],
                    )
                  }
                />
                {categoryInfo(key).label}
              </label>
            );
          })}
        </fieldset>
        {errors.categories && <p className="field-error">{errors.categories}</p>}
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

      {formError && <p className="form-error" role="alert">{formError}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-coral" disabled={saving}>
          {saving ? "Creating…" : "Create plan"}
        </button>
      </div>
    </form>
  );
}
