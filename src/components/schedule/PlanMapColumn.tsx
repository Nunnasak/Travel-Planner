"use client";
import { useEffect, useRef, useState } from "react";
import RouteMap, { type MapDay } from "./RouteMap";

const SCROLL_LOCK_MS = 900;
const ACTIVE_LINE = 0.35;

function mapIsBesidePlan() {
  const map = document.querySelector(".detail-map")?.getBoundingClientRect();
  const plan = document.querySelector(".detail-plan")?.getBoundingClientRect();
  if (!map || !plan) return false;
  return map.left >= plan.right || map.right <= plan.left;
}

export default function PlanMapColumn({ days }: { days: MapDay[] }) {
  const [selected, setSelected] = useState(days[0]?.day_no ?? 1);
  const lockedUntil = useRef(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (Date.now() < lockedUntil.current || !mapIsBesidePlan()) return;
      const sections = days
        .map((day) => ({ dayNo: day.day_no, el: document.getElementById(`day-${day.day_no}`) }))
        .filter((section): section is { dayNo: number; el: HTMLElement } => section.el !== null);
      if (sections.length === 0) return;

      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      let active = sections[0].dayNo;
      if (atBottom && window.scrollY > 0) {
        active = sections[sections.length - 1].dayNo;
      } else {
        const line = window.innerHeight * ACTIVE_LINE;
        for (const section of sections) {
          if (section.el.getBoundingClientRect().top <= line) active = section.dayNo;
        }
      }
      setSelected(active);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [days]);

  function pick(dayNo: number) {
    setSelected(dayNo);
    if (!mapIsBesidePlan()) return;
    lockedUntil.current = Date.now() + SCROLL_LOCK_MS;
    document.getElementById(`day-${dayNo}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <RouteMap days={days} selected={selected} onSelect={pick} />;
}
