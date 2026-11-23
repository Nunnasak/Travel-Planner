type PlaceArea = {
  address: string | null;
  city: { city_name: string; province: { province_name: string } };
};

export function placeLine({ address, city }: PlaceArea) {
  const area = `${city.city_name}, ${city.province.province_name}`;
  const detail = address?.trim();
  if (!detail) return area;
  if (detail.includes(city.city_name)) return detail;
  return `${detail} · ${area}`;
}
