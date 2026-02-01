// src/services/mapplsService.js
const MapplsService = {
  accessToken: null,
  tokenExpiry: null,

  // Get authentication token
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = import.meta.env.VITE_MAPPLS_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_MAPPLS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Mappls credentials not found');
    }

    try {
      const response = await fetch('https://outpost.mappls.com/api/security/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      });

      if (!response.ok) throw new Error('Failed to get access token');

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

      return this.accessToken;
    } catch (error) {
      console.error('Mappls auth error:', error);
      throw error;
    }
  },

  // Geocode location
  async geocodeLocation(address) {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://atlas.mappls.com/api/places/geocode?address=${encodeURIComponent(address)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
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

  // Calculate distance and duration
  async getDistanceAndDuration(fromAddress, toAddress) {
    try {
      const token = await this.getAccessToken();
      const fromCoords = await this.geocodeLocation(fromAddress);
      const toCoords = await this.geocodeLocation(toAddress);

      const response = await fetch(
        `https://apis.mappls.com/advancedmaps/v1/${import.meta.env.VITE_MAPPLS_CLIENT_ID}/distance_matrix/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?rtype=0&region=ind`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
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
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://atlas.mappls.com/api/places/autosuggest?query=${encodeURIComponent(query)}&region=ind&tokenizeAddress=true&pod=CITY,VILLAGE,LOCALITY,SUB_LOCALITY,POI`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();

      if (data.suggestedLocations && data.suggestedLocations.length > 0) {
        return data.suggestedLocations.map(item => ({
          label: item.placeName + (item.placeAddress ? `, ${item.placeAddress}` : ""),
          lat: parseFloat(item.latitude),
          lon: parseFloat(item.longitude),
          display_name: item.placeAddress,
          source: 'mappls'
        }));
      }

      return [];
    } catch (error) {
      console.warn('Mappls suggestions error:', error);
      return [];
    }
  },
};

export default MapplsService;