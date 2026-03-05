// src/services/mapplsService.js

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';

const MapplsService = {
  // Geocode location (address to coordinates)
  async geocodeLocation(address) {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(
        `${baseUrl}/mappls/geocode?address=${encodeURIComponent(address)}`
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();

      if (data.copResults && data.copResults.length > 0) {
        const result = data.copResults[0];
        return {
          lat: parseFloat(result.latitude || result.lat),
          lng: parseFloat(result.longitude || result.lng),
          formattedAddress: result.formattedAddress || address,
        };
      }

      throw new Error('No results found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  },

  // Reverse Geocode (coordinates to address)
  async reverseGeocode(lat, lng) {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(
        `${baseUrl}/mappls/rev_geocode?lat=${lat}&lng=${lng}`
      );

      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];

        // Format a shorter, readable address similar to Nominatim parsing
        const components = [
          result.poi,
          result.street || result.subLocality || result.locality,
          result.city || result.district,
          result.state
        ].filter(Boolean);

        const shortAddress = components.join(', ');

        return {
          formattedAddress: result.formatted_address || shortAddress,
          shortAddress: shortAddress,
          components: result
        };
      }

      throw new Error('No results found for coordinates');
    } catch (error) {
      console.error('Mappls reverse geocoding error:', error);
      throw error;
    }
  },

  // Calculate distance and duration
  async getDistanceAndDuration(fromAddress, toAddress) {
    try {
      const fromCoords = await this.geocodeLocation(fromAddress);
      const toCoords = await this.geocodeLocation(toAddress);

      const baseUrl = getBaseUrl();
      const coordsString = `${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}`;
      const response = await fetch(
        `${baseUrl}/mappls/distance_matrix/${coordsString}`
      );

      if (!response.ok) throw new Error('Distance calculation failed');

      const data = await response.json();

      if (data.results && data.results.distances && data.results.durations) {
        const distanceMeters = data.results.distances[0][1];
        const durationSeconds = data.results.durations[0][1];

        const distanceKm = (distanceMeters / 1000).toFixed(1);
        const durationMins = Math.round(durationSeconds / 60);
        const durationHours = Math.floor(durationMins / 60);
        const remainingMins = durationMins % 60;

        return {
          distanceKm: parseFloat(distanceKm),
          durationMins,
          distanceText: `${distanceKm} km`,
          durationText: durationHours > 0
            ? `${durationHours} hr ${remainingMins} min`
            : `${durationMins} min`,
          fromCoords,
          toCoords,
        };
      }

      throw new Error('Invalid response');
    } catch (error) {
      console.error('Distance error:', error);
      throw error;
    }
  },

  // AutoSuggest locations
  async getSuggestions(query) {
    if (!query || query.length < 2) return [];

    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(
        `${baseUrl}/mappls/autosuggest?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) return [];

      const data = await response.json();

      if (data.suggestedLocations && data.suggestedLocations.length > 0) {
        return data.suggestedLocations.map(item => {
          const placeName = item.placeName || '';
          const placeAddress = item.placeAddress || '';

          // Build a clean label: "Place Name, Locality, City" (avoid repeating placeName in address)
          const label = placeAddress && placeAddress !== placeName
            ? `${placeName}, ${placeAddress}`
            : placeName;

          return {
            label,
            lat: parseFloat(item.latitude || item.lat || 0),
            lon: parseFloat(item.longitude || item.lng || 0),
            display_name: placeAddress || placeName,
            source: 'nominatim'
          };
        }).filter(item => item.lat !== 0 && item.lon !== 0);
      }

      return [];
    } catch (error) {
      console.warn('Mappls suggestions error:', error);
      return [];
    }
  },
};

export default MapplsService;