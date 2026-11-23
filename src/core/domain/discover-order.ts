const SEED_TIME_ZONE = "Asia/Bangkok";

export function dailySeed(now: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SEED_TIME_ZONE }).format(now);
}

function shuffleKey(seed: string, id: number) {
  let hash = 0x811c9dc5;
  for (const char of `${seed}:${id}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

export type DiscoverCandidate = { schedule_id: number; has_cover: boolean };

export function orderForDiscover<T extends DiscoverCandidate>(plans: T[], seed: string): T[] {
  return plans
    .map((plan) => ({ plan, key: shuffleKey(seed, plan.schedule_id) }))
    .sort(
      (a, b) =>
        Number(b.plan.has_cover) - Number(a.plan.has_cover) ||
        a.key - b.key ||
        a.plan.schedule_id - b.plan.schedule_id,
    )
    .map(({ plan }) => plan);
}
