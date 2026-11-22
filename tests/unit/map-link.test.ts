import { describe, expect, it } from "vitest";
import { BadRequestError } from "@/core/errors/bad-request.error";
import type { UrlResolver } from "@/core/ports/url-resolver";
import { coordinatesFromUrl, isGoogleMapsUrl, MapLinkService } from "@/core/service/map-link.service";

const PLACE_URL =
  "https://www.google.com/maps/place/Wat+Phra+That+Doi+Suthep/@18.8048,98.9216,17z/data=!3m1!4b1!4m6!3m5!1s0x30da3a7d0f0b1c3f:0x1!8m2!3d18.8049783!4d98.9216355!16s";

describe("coordinatesFromUrl", () => {
  it("prefers the place pin over the map view", () => {
    expect(coordinatesFromUrl(PLACE_URL)).toEqual({ latitude: 18.8049783, longitude: 98.9216355 });
  });

  it.each([
    ["a map view", "https://www.google.com/maps/@13.7503,100.4913,15z", { latitude: 13.7503, longitude: 100.4913 }],
    ["a search link", "https://www.google.com/maps/search/?api=1&query=13.75,100.49", { latitude: 13.75, longitude: 100.49 }],
    ["a q= link", "https://maps.google.com/?q=7.8804,98.3923", { latitude: 7.8804, longitude: 98.3923 }],
    ["an ll= link", "https://maps.google.com/?ll=-33.86,151.2", { latitude: -33.86, longitude: 151.2 }],
    ["an encoded pin", "https://www.google.com/maps/place/x/data=%213d12.5%214d99.9", { latitude: 12.5, longitude: 99.9 }],
  ])("reads %s", (_label, url, expected) => {
    expect(coordinatesFromUrl(url)).toEqual(expected);
  });

  it.each([
    ["a place name only", "https://www.google.com/maps/place/Wat+Pho"],
    ["out of range numbers", "https://maps.google.com/?q=123.4,500.1"],
    ["a broken escape", "https://www.google.com/maps/place/%E0%A4"],
  ])("returns null for %s", (_label, url) => {
    expect(coordinatesFromUrl(url)).toBeNull();
  });
});

describe("isGoogleMapsUrl", () => {
  it.each([
    "https://maps.app.goo.gl/abc123",
    "https://goo.gl/maps/abc123",
    "https://maps.google.com/?q=1,2",
    "https://www.google.com/maps/place/x",
    "https://www.google.co.th/maps/@1,2,3z",
  ])("accepts %s", (url) => {
    expect(isGoogleMapsUrl(new URL(url))).toBe(true);
  });

  it.each([
    "http://maps.google.com/?q=1,2",
    "https://goo.gl/abc",
    "https://www.google.com/search?q=maps",
    "https://evil.example/maps/@1,2",
    "https://maps.app.goo.gl.evil.example/abc",
  ])("rejects %s", (url) => {
    expect(isGoogleMapsUrl(new URL(url))).toBe(false);
  });
});

function fakeResolver(result: string | Error) {
  const calls: string[] = [];
  const resolver: UrlResolver = {
    async follow(url) {
      calls.push(url);
      if (result instanceof Error) throw result;
      return result;
    },
  };
  return { resolver, calls };
}

describe("MapLinkService.locate", () => {
  it("reads coordinates straight from a full link without any request", async () => {
    const { resolver, calls } = fakeResolver(new Error("should not be called"));

    await expect(new MapLinkService(resolver).locate(PLACE_URL)).resolves.toEqual({
      latitude: 18.8049783,
      longitude: 98.9216355,
    });
    expect(calls).toEqual([]);
  });

  it("follows a short link and reads the place it opens", async () => {
    const { resolver, calls } = fakeResolver(PLACE_URL);

    await expect(new MapLinkService(resolver).locate("https://maps.app.goo.gl/AbC123")).resolves.toEqual({
      latitude: 18.8049783,
      longitude: 98.9216355,
    });
    expect(calls).toEqual(["https://maps.app.goo.gl/AbC123"]);
  });

  it.each([
    ["not a link", "Doi Suthep"],
    ["another site", "https://example.com/maps/@1,2"],
    ["a full link without a location", "https://www.google.com/maps/place/Wat+Pho"],
  ])("rejects %s without a request", async (_label, link) => {
    const { resolver, calls } = fakeResolver(PLACE_URL);

    await expect(new MapLinkService(resolver).locate(link)).rejects.toBeInstanceOf(BadRequestError);
    expect(calls).toEqual([]);
  });

  it("reports a short link that can't be opened", async () => {
    const { resolver } = fakeResolver(new Error("timeout"));

    await expect(new MapLinkService(resolver).locate("https://maps.app.goo.gl/broken")).rejects.toMatchObject({
      field: "map_url",
    });
  });
});
