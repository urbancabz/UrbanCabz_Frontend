// src/services/routingService.js
const RoutingService = {
  // Geocode location using Nominatim (OpenStreetMap)
  async geocodeLocation(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1`,
        {
          headers: {
            'User-Agent': 'UrbanCabz/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formattedAddress: data[0].display_name,
        };
      }
      
      throw new Error('Location not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  },

  // Calculate distance and duration using OSRM with route geometry
  async getDistanceAndDuration(fromAddress, toAddress) {
    try {
      // Add delay to respect Nominatim rate limits (1 request per second)
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      const fromCoords = await this.geocodeLocation(fromAddress);
      await delay(1000); // Wait 1 second between requests
      const toCoords = await this.geocodeLocation(toAddress);

      // Use OSRM for route calculation - request full geometry
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

        // Extract route coordinates for map display
        const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        return {
          distanceKm: parseFloat(distanceKm),
          durationMins,
          distanceText: `${distanceKm} km`,
          durationText: durationHours > 0 
            ? `${durationHours} hr ${remainingMins} min` 
            : `${durationMins} min`,
          fromCoords,
          toCoords,
          routeCoordinates, // Add this for map drawing
        };
      }

      throw new Error('No route found');
    } catch (error) {
      console.error('Distance calculation error:', error);
      throw error;
    }
  },

  // Alternative: Calculate straight-line distance (fallback)
  calculateStraightLineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
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