"use client";
import { useState } from "react";

type MapStop = {
  location: {
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    city: { city_name: string; province: { province_name: string } };
  };
};

export type MapDay = { day_no: number; stops: MapStop[] };

const MAX_STOPS = 10;

function placeQuery(stop: MapStop) {
  const { name, city, latitude, longitude } = stop.location;
  if (latitude != null && longitude != null) return `${latitude},${longitude}`;
  return `${name} ${city.city_name} ${city.province.province_name} ประเทศไทย`;
}

function embedUrl(stops: MapStop[]) {
  if (stops.length === 1) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeQuery(stops[0]))}&output=embed`;
  }
  const [first, ...rest] = stops.map(placeQuery);
  const daddr = rest.map(encodeURIComponent).join("+to:");
  return `https://maps.google.com/maps?saddr=${encodeURIComponent(first)}&daddr=${daddr}&output=embed`;
}

function openUrl(stops: MapStop[]) {
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

type Props = {
  days: MapDay[];
  selected?: number;
  onSelect?: (dayNo: number) => void;
};

export default function RouteMap({ days, selected, onSelect }: Props) {
  const firstWithStops = days.find((day) => day.stops.length > 0)?.day_no ?? 1;
  const [ownSelected, setOwnSelected] = useState(firstWithStops);
  const current = selected ?? ownSelected;
  const choose = onSelect ?? setOwnSelected;
  const day = days.find((d) => d.day_no === current) ?? days[0];
  const stops = day?.stops.slice(0, MAX_STOPS) ?? [];

  return (
    <div className="route-map">
      <div className="map-tabs" role="tablist" aria-label="เลือกวันบนแผนที่">
        {days.map((d) => (
          <button
            key={d.day_no}
            type="button"
            role="tab"
            aria-selected={d.day_no === day?.day_no}
            onClick={() => choose(d.day_no)}
          >
            วันที่ {d.day_no}
          </button>
        ))}
      </div>

      {stops.length === 0 ? (
        <div className="map-empty">เพิ่มสถานที่ในวันที่ {day?.day_no ?? 1} เพื่อดูบนแผนที่</div>
      ) : (
        <>
          <iframe
            key={embedUrl(stops)}
            className="map-frame"
            title={`แผนที่วันที่ ${day.day_no}`}
            src={embedUrl(stops)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a className="btn-outline map-open" href={openUrl(stops)} target="_blank" rel="noopener noreferrer">
            {stops.length === 1 ? "เปิดใน Google Maps" : "เปิดเส้นทางใน Google Maps"}
          </a>
          {day.stops.length > MAX_STOPS && (
            <p className="drag-hint">แผนที่แสดงแค่ {MAX_STOPS} สถานที่แรกของวันนี้</p>
          )}
        </>
      )}
    </div>
  );
}
