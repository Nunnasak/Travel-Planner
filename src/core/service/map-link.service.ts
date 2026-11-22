import { BadRequestError } from "../errors/bad-request.error";
import type { UrlResolver } from "../ports/url-resolver";

export type Coordinates = { latitude: number; longitude: number };

const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"]);
const MAPS_HOSTS = new Set(["maps.google.com", "maps.google.co.th"]);
const GOOGLE_HOSTS = new Set(["google.com", "www.google.com", "google.co.th", "www.google.co.th"]);

const NOT_A_MAPS_LINK = "Paste a Google Maps link (https://maps.app.goo.gl/… or https://www.google.com/maps/…).";
const NO_LOCATION = "Couldn't find the location in this link. Open the place in Google Maps, tap Share and copy the link.";

export function isGoogleMapsUrl(url: URL) {
  if (url.protocol !== "https:") return false;
  if (SHORT_LINK_HOSTS.has(url.hostname)) return url.hostname !== "goo.gl" || url.pathname.startsWith("/maps");
  if (MAPS_HOSTS.has(url.hostname)) return true;
  return GOOGLE_HOSTS.has(url.hostname) && url.pathname.startsWith("/maps");
}

function valid(latitude: number, longitude: number): Coordinates | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

const NUMBER = String.raw`(-?\d{1,3}(?:\.\d+)?)`;

function decode(text: string) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

export function coordinatesFromUrl(link: string): Coordinates | null {
  const text = decode(link);
  const place = text.match(new RegExp(String.raw`!3d${NUMBER}!4d${NUMBER}`));
  if (place) return valid(Number(place[1]), Number(place[2]));

  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  for (const key of ["q", "query", "ll", "destination", "center"]) {
    const value = url.searchParams.get(key)?.trim();
    const pair = value?.match(new RegExp(String.raw`^${NUMBER},\s*${NUMBER}$`));
    if (pair) return valid(Number(pair[1]), Number(pair[2]));
  }

  const view = text.match(new RegExp(String.raw`@${NUMBER},${NUMBER}`));
  if (view) return valid(Number(view[1]), Number(view[2]));
  return null;
}

export class MapLinkService {
  constructor(private readonly resolver: UrlResolver) {}

  async locate(link: string): Promise<Coordinates> {
    let url: URL;
    try {
      url = new URL(link.trim());
    } catch {
      throw new BadRequestError(NOT_A_MAPS_LINK, "map_url");
    }
    if (!isGoogleMapsUrl(url)) throw new BadRequestError(NOT_A_MAPS_LINK, "map_url");

    const direct = coordinatesFromUrl(url.toString());
    if (direct) return direct;
    if (!SHORT_LINK_HOSTS.has(url.hostname)) throw new BadRequestError(NO_LOCATION, "map_url");

    let finalUrl: string;
    try {
      finalUrl = await this.resolver.follow(url.toString(), isGoogleMapsUrl);
    } catch {
      throw new BadRequestError("Couldn't open this Google Maps link. Check it and try again.", "map_url");
    }
    const resolved = coordinatesFromUrl(finalUrl);
    if (!resolved) throw new BadRequestError(NO_LOCATION, "map_url");
    return resolved;
  }
}
