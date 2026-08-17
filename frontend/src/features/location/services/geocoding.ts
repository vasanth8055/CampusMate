export interface GeocodedAddress {
  formattedAddress: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

const geocodeCache = new Map<string, GeocodedAddress>();

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodedAddress> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "Accept-Language": "en",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Reverse geocode failed: ${response.statusText}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const parts: string[] = [];
    if (addr.road || addr.pedestrian || addr.building) {
      parts.push(addr.road || addr.pedestrian || addr.building);
    }
    if (addr.suburb || addr.neighbourhood || addr.residential) {
      parts.push(addr.suburb || addr.neighbourhood || addr.residential);
    }
    if (addr.city || addr.town || addr.village || addr.county) {
      parts.push(addr.city || addr.town || addr.village || addr.county);
    }
    if (addr.state) {
      parts.push(addr.state);
    }

    const formattedAddress =
      parts.length > 0
        ? parts.join(", ")
        : data.display_name?.split(",").slice(0, 3).join(",") ||
          `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    const result: GeocodedAddress = {
      formattedAddress,
      road: addr.road,
      suburb: addr.suburb || addr.neighbourhood,
      city: addr.city || addr.town || addr.village,
      state: addr.state,
      country: addr.country,
      latitude: lat,
      longitude: lng,
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn("Reverse geocoding fallback triggered:", error);
    const fallback: GeocodedAddress = {
      formattedAddress: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      latitude: lat,
      longitude: lng,
    };
    return fallback;
  }
}
