import type { UrlResolver } from "@/core/ports/url-resolver";

const MAX_HOPS = 5;
const TIMEOUT_MS = 5000;

export class FetchUrlResolver implements UrlResolver {
  async follow(start: string, isAllowed: (url: URL) => boolean) {
    let current = new URL(start);
    for (let hop = 0; hop < MAX_HOPS; hop++) {
      if (!isAllowed(current)) throw new Error(`Redirected to a host that is not allowed: ${current.hostname}`);
      const response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; TripPlanner/1.0)" },
      });
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (response.status < 300 || response.status >= 400 || !location) return current.toString();
      current = new URL(location, current);
    }
    throw new Error("Too many redirects");
  }
}
