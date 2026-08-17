/**
 * CampusMate Road Routing Service
 * Fetches real road-following polylines from OSRM (Open Source Routing Machine)
 * with in-memory caching to avoid redundant API calls.
 */

const routeCache = new Map<string, [number, number][]>();

export async function fetchRoadRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<[number, number][]> {
  const [lat1, lng1] = origin;
  const [lat2, lng2] = destination;

  if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
    return [origin, destination];
  }

  // Round to 5 decimal places for cache key (~1m precision)
  const cacheKey = `${lat1.toFixed(5)},${lng1.toFixed(5)}_${lat2.toFixed(5)},${lng2.toFixed(5)}`;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Routing HTTP error: ${res.status}`);
    }

    const data = await res.json();

    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const geojsonCoords = data.routes[0].geometry.coordinates as [number, number][];
      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      const leafletCoords: [number, number][] = geojsonCoords.map(([lng, lat]) => [lat, lng]);

      routeCache.set(cacheKey, leafletCoords);
      return leafletCoords;
    }

    throw new Error("No road route found in response");
  } catch (err) {
    console.warn("Road routing service fallback triggered:", err);
    const fallback: [number, number][] = [origin, destination];
    routeCache.set(cacheKey, fallback);
    return fallback;
  }
}
