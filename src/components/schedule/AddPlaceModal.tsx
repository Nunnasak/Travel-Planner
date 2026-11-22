"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { pickFieldErrors, sendJson } from "@/lib/api-client";
import ImageDropzone from "@/components/ui/image-dropzone";
import SelectMenu from "@/components/ui/select-menu";
import { UPLOAD_PATH } from "@/core/schema/image.schema";

type Place = {
  location_id: number;
  name: string;
  address: string;
  image_url: string | null;
  city: { city_name: string; province: { province_name: string } };
};
type Province = { province_id: number; province_name: string };
type City = { city_id: number; city_name: string };

const FIELDS = ["location_id", "name", "address", "city_id", "image_url", "map_url", "day_no", "visit_time"] as const;
type Field = (typeof FIELDS)[number];

type Props = {
  scheduleId: number;
  totalDays: number;
  initialDay: number;
  onClose: () => void;
};

export default function AddPlaceModal({ scheduleId, totalDays, initialDay, onClose }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"search" | "new">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(true);
  const [picked, setPicked] = useState<Place | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provinceId, setProvinceId] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityId] = useState("");

  const [day, setDay] = useState(initialDay);
  const [time, setTime] = useState("09:00");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (mode !== "search") return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/locations?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) setResults(await res.json());
      } catch {}
      setSearching(false);
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, mode]);

  useEffect(() => {
    if (mode !== "new" || provinces.length > 0) return;
    fetch("/api/provinces")
      .then((res) => (res.ok ? res.json() : []))
      .then(setProvinces)
      .catch(() => {});
  }, [mode, provinces.length]);

  function changeProvince(value: string) {
    setProvinceId(value);
    setCityId("");
    setCities([]);
    if (!value) return;
    fetch(`/api/provinces/${value}/cities`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setCities)
      .catch(() => {});
  }

  function clear(field: Field) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const next: Partial<Record<Field, string>> = {};
    if (mode === "search" && !picked) next.location_id = "Pick a place from the list.";
    if (mode === "new") {
      if (!name.trim()) next.name = "Enter the place name.";
      if (!address.trim()) next.address = "Enter the address.";
      if (!cityId) next.city_id = "Pick a district.";
    }
    if (!time) next.visit_time = "Pick a time.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      let locationId = picked?.location_id;
      if (mode === "new") {
        const created = await sendJson("POST", "/api/locations", {
          name,
          address,
          city_id: Number(cityId),
          image_url: imageUrl,
          map_url: mapUrl,
        });
        if (!created.ok) {
          const fieldErrors = pickFieldErrors(created.data.errors, FIELDS);
          setErrors(fieldErrors);
          if (Object.keys(fieldErrors).length === 0) {
            setFormError(created.data.message ?? "Couldn't add the place.");
          }
          setSaving(false);
          return;
        }
        locationId = created.data.location_id as number;
        setPicked(created.data as unknown as Place);
        setMode("search");
      }

      const result = await sendJson("POST", `/api/schedules/${scheduleId}/items`, {
        location_id: locationId,
        day_no: day,
        visit_time: time,
      });
      if (!result.ok) {
        const fieldErrors = pickFieldErrors(result.data.errors, FIELDS);
        setErrors(fieldErrors);
        if (Object.keys(fieldErrors).length === 0) {
          setFormError(result.data.message ?? "Couldn't add the place to the plan.");
        }
        setSaving(false);
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setFormError("Cannot reach the server. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-place-title"
        onSubmit={submit}
        noValidate
      >
        <div className="modal-head">
          <h2 id="add-place-title">Add plan</h2>
          <button type="button" className="stop-remove" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "search"} onClick={() => setMode("search")}>
            Find a place
          </button>
          <button type="button" role="tab" aria-selected={mode === "new"} onClick={() => setMode("new")}>
            New place
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-main">
            {mode === "search" ? (
              <>
                <div className="searchbar modal-search">
                  <input
                    autoFocus
                    placeholder="Search places, districts, provinces…"
                    aria-label="Search places"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <ul className="place-results" aria-busy={searching}>
                  {results.map((place) => (
                    <li key={place.location_id}>
                      <button
                        type="button"
                        className="place-option"
                        aria-pressed={picked?.location_id === place.location_id}
                        onClick={() => {
                          setPicked(place);
                          clear("location_id");
                        }}
                      >
                        <strong>{place.name}</strong>
                        <span>
                          {place.address} · {place.city.city_name}, {place.city.province.province_name}
                        </span>
                      </button>
                    </li>
                  ))}
                  {!searching && results.length === 0 && (
                    <li className="day-empty">No places found. Use &quot;New place&quot; to add it.</li>
                  )}
                </ul>
                {errors.location_id && <p className="field-error">{errors.location_id}</p>}
              </>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="place-name">Name</label>
                  <input
                    id="place-name"
                    placeholder="Write here…"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clear("name");
                    }}
                    aria-invalid={errors.name ? true : undefined}
                  />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                <div className="field">
                  <label htmlFor="place-address">Address</label>
                  <input
                    id="place-address"
                    placeholder="Write here…"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clear("address");
                    }}
                    aria-invalid={errors.address ? true : undefined}
                  />
                  {errors.address && <p className="field-error">{errors.address}</p>}
                </div>
                <div className="form-row half">
                  <div className="field">
                    <label htmlFor="place-province">Province</label>
                    <SelectMenu
                      block
                      id="place-province"
                      label="Province"
                      value={provinceId}
                      options={[
                        { value: "", label: "Select Province" },
                        ...provinces.map((p) => ({ value: String(p.province_id), label: p.province_name })),
                      ]}
                      onChange={changeProvince}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="place-city">District</label>
                    <SelectMenu
                      block
                      id="place-city"
                      label="District"
                      value={cityId}
                      disabled={!provinceId}
                      invalid={Boolean(errors.city_id)}
                      options={[
                        { value: "", label: "Select District" },
                        ...cities.map((c) => ({ value: String(c.city_id), label: c.city_name })),
                      ]}
                      onChange={(next) => {
                        setCityId(next);
                        clear("city_id");
                      }}
                    />
                    {errors.city_id && <p className="field-error">{errors.city_id}</p>}
                  </div>
                </div>
                <div className="field">
                  <span className="field-label">Photo (optional)</span>
                  {imageUrl.startsWith(UPLOAD_PATH) ? (
                    <div className="uploaded-row">
                      <span>Using your uploaded photo</span>
                      <button type="button" className="btn-outline small" onClick={() => setImageUrl("")}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <ImageDropzone
                      compact
                      onUploaded={(url) => {
                        setImageUrl(url);
                        clear("image_url");
                      }}
                    />
                  )}
                  {errors.image_url && <p className="field-error">{errors.image_url}</p>}
                </div>
                <div className="field">
                  <label htmlFor="place-map">Google Maps link (optional)</label>
                  <input
                    id="place-map"
                    type="url"
                    inputMode="url"
                    placeholder="https://maps.app.goo.gl/…"
                    value={mapUrl}
                    onChange={(e) => {
                      setMapUrl(e.target.value);
                      clear("map_url");
                    }}
                    aria-invalid={errors.map_url ? true : undefined}
                    aria-describedby="place-map-hint"
                  />
                  {errors.map_url ? (
                    <p className="field-error">{errors.map_url}</p>
                  ) : (
                    <p id="place-map-hint" className="field-hint">
                      Open the place in Google Maps, tap Share and paste the link here to pin the exact spot.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="modal-side">
            <div className="field">
              <label>Visit date</label>
              <div className="stepper">
                <button type="button" aria-label="Previous day" disabled={day <= 1} onClick={() => setDay((d) => d - 1)}>
                  −
                </button>
                <span>DAY {day}</span>
                <button
                  type="button"
                  aria-label="Next day"
                  disabled={day >= totalDays}
                  onClick={() => setDay((d) => d + 1)}
                >
                  +
                </button>
              </div>
              {errors.day_no && <p className="field-error">{errors.day_no}</p>}
            </div>
            <div className="field">
              <label htmlFor="visit-time">Visit time</label>
              <input
                id="visit-time"
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  clear("visit_time");
                }}
                aria-invalid={errors.visit_time ? true : undefined}
              />
              {errors.visit_time && <p className="field-error">{errors.visit_time}</p>}
            </div>
            {picked && mode === "search" && (
              <p className="picked">Selected: <strong>{picked.name}</strong></p>
            )}
          </div>
        </div>

        {formError && <p className="form-error" role="alert">{formError}</p>}

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn-coral" disabled={saving}>{saving ? "Adding…" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}
