const NOMINATIM_MIN_INTERVAL = 700;
const GEO_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const ROUTE_CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours
const geocodeMemoryCache = new Map();
const routeMemoryCache = new Map();
let lastGeocodeRequestTs = 0;

import MapplsService from './mapplsService';

const hasSessionStorage = typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeAddress = (address = '') => address.trim().toLowerCase();

const readFromStorage = (key, ttl) => {
  if (!hasSessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    const value = parsed?.value ?? parsed;
    const timestamp = parsed?.ts ?? 0;

    if (ttl && timestamp && Date.now() - timestamp > ttl) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return value;
  } catch (err) {
    console.warn('Session cache parse error', err);
    return null;
  }
};

const writeToStorage = (key, value) => {
  if (!hasSessionStorage) return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), value }));
  } catch (err) {
    // Ignore storage quota errors
  }
};

const geoStorageKey = (normalizedAddress) => `rc_geo_${normalizedAddress}`;
const routeStorageKey = (normalizedFrom, normalizedTo) => `rc_route_${normalizedFrom}_${normalizedTo}`;

const RoutingService = {
  getCachedRouteMetrics(fromAddress, toAddress) {
    const normalizedFrom = normalizeAddress(fromAddress);
    const normalizedTo = normalizeAddress(toAddress);
    if (!normalizedFrom || !normalizedTo) return null;

    const cacheKey = `${normalizedFrom}|${normalizedTo}`;
    if (routeMemoryCache.has(cacheKey)) {
      return routeMemoryCache.get(cacheKey);
    }

    const stored = readFromStorage(routeStorageKey(normalizedFrom, normalizedTo), ROUTE_CACHE_TTL);
    if (stored) {
      routeMemoryCache.set(cacheKey, stored);
      return stored;
    }

    return null;
  },

  async getSuggestions(query) {
    const normalizedQuery = normalizeAddress(query);
    if (!normalizedQuery || normalizedQuery.length < 2) return [];

    const cacheKey = `suggest_v3_${normalizedQuery}`;
    if (geocodeMemoryCache.has(cacheKey)) {
      return geocodeMemoryCache.get(cacheKey);
    }

    try {
      // 1. Try Mappls (MapmyIndia) first for high-quality India-specific suggestions
      let suggestions = [];
      try {
        suggestions = await MapplsService.getSuggestions(query);
      } catch (err) {
        console.warn("Mappls suggest fail, falling back to Nominatim", err);
      }

      if (suggestions && suggestions.length > 0) {
        geocodeMemoryCache.set(cacheKey, suggestions);
        return suggestions;
      }

      // 2. Fallback to Nominatim (OSM)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=10&countrycodes=in`,
        {
          headers: {
            "User-Agent": "UrbanCabz/1.0",
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();

      suggestions = data
        .filter(item => {
          // Filter out low quality results
          const lower = item.display_name.toLowerCase();
          if (lower.includes("unnamed road")) return false;
          if (lower.includes("unnamed way")) return false;
          return true;
        })
        .map((item) => {
          const addr = item.address || {};

          const building = addr.building || addr.house_name || addr.apartment || addr.residential || "";
          const road = addr.road || "";
          const area = addr.neighbourhood || addr.suburb || addr.subdistrict || "";
          const city = addr.city || addr.town || addr.village || addr.district || "";
          const state = addr.state || "";

          // Prioritize Name and Society/Building
          const components = [
            item.name && item.name !== city ? item.name : "",
            building,
            road,
            area,
            city,
            state
          ].filter((val, index, self) =>
            val &&
            val.length > 1 &&
            self.indexOf(val) === index
          );

          let label = components.join(", ");

          if (components.length < 3) {
            label = item.display_name.split(", ").slice(0, 4).join(", ");
          }

          if (!label.toLowerCase().includes("india")) {
            label += ", India";
          }

          return {
            label,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            display_name: item.display_name,
            source: 'nominatim'
          };
        });

      geocodeMemoryCache.set(cacheKey, suggestions);
      return suggestions;
    } catch (error) {
      console.warn("Suggestion fetch error:", error);
      return [];
    }
  },

  async geocodeLocation(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) throw new Error('Address is required');

    if (geocodeMemoryCache.has(normalized)) {
      return geocodeMemoryCache.get(normalized);
    }

    const cached = readFromStorage(geoStorageKey(normalized), GEO_CACHE_TTL);
    if (cached) {
      geocodeMemoryCache.set(normalized, cached);
      return cached;
    }

    // Respect Nominatim rate limit (>= 1 request/sec)
    const now = Date.now();
    const elapsed = now - lastGeocodeRequestTs;
    if (lastGeocodeRequestTs && elapsed < NOMINATIM_MIN_INTERVAL) {
      await delay(NOMINATIM_MIN_INTERVAL - elapsed);
    }
    lastGeocodeRequestTs = Date.now();

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1`,
        {
          headers: {
            'User-Agent': 'UrbanCabz/1.0',
          },
        }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();

      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formattedAddress: data[0].display_name,
        };

        geocodeMemoryCache.set(normalized, result);
        writeToStorage(geoStorageKey(normalized), result);
        return result;
      }

      throw new Error('Location not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  },

  async getDistanceAndDuration(fromAddress, toAddress) {
    // If inputs are objects with lat/lng, use them directly
    let fromCoords = typeof fromAddress === 'object' ? fromAddress : null;
    let toCoords = typeof toAddress === 'object' ? toAddress : null;

    let normalizedFrom = fromCoords ? `lat:${fromCoords.lat},lng:${fromCoords.lng}` : normalizeAddress(fromAddress);
    let normalizedTo = toCoords ? `lat:${toCoords.lat},lng:${toCoords.lng}` : normalizeAddress(toAddress);

    if (!normalizedFrom || !normalizedTo) throw new Error('Valid locations are required');

    const cacheKey = `${normalizedFrom}|${normalizedTo}`;
    if (routeMemoryCache.has(cacheKey)) {
      return routeMemoryCache.get(cacheKey);
    }

    // Try storage only if we have string addresses (or unique keys for coords)
    // For simplicity, we skip storage read for raw coords unless we serialize them consistently
    // But let's keep the existing logic where possible

    // NOTE: If we really want to cache coord-based routes, we need a stable key. 
    // The simple stringification above works for session/memory cache.

    try {
      // 1. Resolve Pickup
      if (!fromCoords) {
        fromCoords = await this.geocodeLocation(fromAddress);
      }

      // 2. Resolve Drop
      if (!toCoords) {
        toCoords = await this.geocodeLocation(toAddress);
      }

      const metrics = await this.fetchRouteMetrics(fromCoords, toCoords);
      routeMemoryCache.set(cacheKey, metrics);
      // We can create a fake "address" key for storage if needed, or just skip per-session storage for manual pins
      // to avoid filling it with unique coords.
      if (typeof fromAddress === 'string' && typeof toAddress === 'string') {
        writeToStorage(routeStorageKey(normalizedFrom, normalizedTo), metrics);
      }
      return metrics;
    } catch (error) {
      console.error('Distance calculation error:', error);

      if (fromCoords && toCoords) {
        const fallback = this.buildFallbackMetrics(fromCoords, toCoords);
        routeMemoryCache.set(cacheKey, fallback);
        return fallback;
      }

      throw error;
    }
  },

  async fetchRouteMetrics(fromCoords, toCoords) {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=full&geometries=geojson`
    );

    if (!response.ok) throw new Error('Route calculation failed');

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceMeters = route.distance;
      const durationSeconds = route.duration;

      const distanceKm = (distanceMeters / 1000).toFixed(1);
      const durationMins = Math.round(durationSeconds / 60);
      const durationHours = Math.floor(durationMins / 60);
      const remainingMins = durationMins % 60;

      const routeCoordinates = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);

      return {
        distanceKm: parseFloat(distanceKm),
        durationMins,
        distanceText: `${distanceKm} km`,
        durationText:
          durationHours > 0 ? `${durationHours} hr ${remainingMins} min` : `${durationMins} min`,
        fromCoords,
        toCoords,
        routeCoordinates,
        isEstimate: false,
      };
    }

    throw new Error('No route found');
  },

  buildFallbackMetrics(fromCoords, toCoords) {
    const distanceKm = this.calculateStraightLineDistance(
      fromCoords.lat,
      fromCoords.lng,
      toCoords.lat,
      toCoords.lng
    );

    const roundedDistance = Math.max(Math.round(distanceKm * 10) / 10, 1);
    const averageSpeedKmph = 45;
    const durationMins = Math.max(15, Math.round((roundedDistance / averageSpeedKmph) * 60));
    const durationHours = Math.floor(durationMins / 60);
    const remainingMins = durationMins % 60;

    return {
      distanceKm: roundedDistance,
      durationMins,
      distanceText: `${roundedDistance} km (est.)`,
      durationText:
        durationHours > 0
          ? `${durationHours} hr ${remainingMins} min (est.)`
          : `${durationMins} min (est.)`,
      fromCoords,
      toCoords,
      routeCoordinates: null,
      isEstimate: true,
    };
  },

  calculateStraightLineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  },
};

export default RoutingService;