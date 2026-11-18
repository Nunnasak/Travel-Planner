"use client";
import { useState } from "react";
import type { ScheduleDay, ScheduleStop } from "@/lib/schedule";

const MAX_STOPS = 10;

function placeQuery(stop: ScheduleStop) {
  const { name, city } = stop.location;
  return `${name} ${city.city_name} ${city.province.province_name}`;
}

function embedUrl(stops: ScheduleStop[]) {
  if (stops.length === 1) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeQuery(stops[0]))}&output=embed`;
  }
  const [first, ...rest] = stops.map(placeQuery);
  const daddr = rest.map(encodeURIComponent).join("+to:");
  return `https://maps.google.com/maps?saddr=${encodeURIComponent(first)}&daddr=${daddr}&output=embed`;
}

function openUrl(stops: ScheduleStop[]) {
  const places = stops.map(placeQuery);
  if (places.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(places[0])}`;
  }
  const params = new URLSearchParams({
    api: "1",
    origin: places[0],
    destination: places[places.length - 1],
    travelmode: "driving",
  });
  if (places.length > 2) params.set("waypoints", places.slice(1, -1).join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
}

export default function RouteMap({ days }: { days: ScheduleDay[] }) {
  const firstWithStops = days.find((day) => day.stops.length > 0)?.day_no ?? 1;
  const [selected, setSelected] = useState(firstWithStops);
  const day = days.find((d) => d.day_no === selected) ?? days[0];
  const stops = day?.stops.slice(0, MAX_STOPS) ?? [];

  return (
    <div className="route-map">
      <div className="map-tabs" role="tablist" aria-label="Map day">
        {days.map((d) => (
          <button
            key={d.day_no}
            type="button"
            role="tab"
            aria-selected={d.day_no === day?.day_no}
            onClick={() => setSelected(d.day_no)}
          >
            Day {d.day_no}
          </button>
        ))}
      </div>

      {stops.length === 0 ? (
        <div className="map-empty">Add places to Day {day?.day_no ?? 1} to see them on the map.</div>
      ) : (
        <>
          <iframe
            key={embedUrl(stops)}
            className="map-frame"
            title={`Map of day ${day.day_no}`}
            src={embedUrl(stops)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a className="btn-outline map-open" href={openUrl(stops)} target="_blank" rel="noopener noreferrer">
            {stops.length === 1 ? "Open in Google Maps" : "Open route in Google Maps"}
          </a>
          {day.stops.length > MAX_STOPS && (
            <p className="drag-hint">The map shows the first {MAX_STOPS} places of this day.</p>
          )}
        </>
      )}
    </div>
  );
}
