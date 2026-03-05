// src/services/apiClient.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";

const pendingRequests = new Map();

function getAuthToken() {
  const userType = localStorage.getItem("userType");
  if (userType === "admin") {
    return localStorage.getItem("adminToken");
  } else if (userType === "customer") {
    return localStorage.getItem("customerToken");
  } else if (userType === "business") {
    return localStorage.getItem("businessToken");
  }
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("businessToken")
  );
}

function buildHeaders(customHeaders = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Helper to clear all pending GET requests.
 * Used after mutations to ensure next fetches get fresh data.
 */
function invalidateGetCache() {
  // console.log("[API Client] Invalidating all GET caches");
  pendingRequests.clear();
}

export const apiClient = {
  /**
   * GET request with deduplication and brief caching
   * @param {string} endpoint - API endpoint starting with /
   * @param {Object} options - { params, headers, cacheTTL, bypassCache }
   */
  async get(endpoint, options = {}) {
    const { params, headers, cacheTTL = 2000, bypassCache = false } = options;
    const queryStr = params ? `?${new URLSearchParams(params).toString()}` : "";
    const cacheKey = `GET:${endpoint}${queryStr}`;

    if (!bypassCache && pendingRequests.has(cacheKey)) {
      // console.log(`[API Client] Deduplicating request: ${cacheKey}`);
      return pendingRequests.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}${queryStr}`, {
          method: "GET",
          headers: buildHeaders(headers),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          return {
            success: false,
            status: response.status,
            message: data.message || "Request failed",
          };
        }

        return { success: true, data: data.data || data };
      } catch (error) {
        console.error(`API GET error [${endpoint}]:`, error);
        return {
          success: false,
          message: error.message || "Network error while fetching data",
        };
      } finally {
        // Keep in map for a short duration to prevent rapid repeat calls (like React StrictMode)
        // But remove it eventually so we can fetch fresh data later
        setTimeout(() => {
          if (pendingRequests.get(cacheKey) === promise) {
            pendingRequests.delete(cacheKey);
          }
        }, cacheTTL);
      }
    })();

    pendingRequests.set(cacheKey, promise);
    return promise;
  },

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: buildHeaders(options.headers),
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data.message || "Action failed",
          error: data.error,
        };
      }
      invalidateGetCache(); // Success: ensure next GETs are fresh
      return { success: true, data: data.data || data, message: data.message };
    } catch (error) {
      console.error(`API POST error [${endpoint}]:`, error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: buildHeaders(options.headers),
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data.message || "Update failed",
        };
      }
      invalidateGetCache(); // Success: ensure next GETs are fresh
      return { success: true, data: data.data || data, message: data.message };
    } catch (error) {
      console.error(`API PUT error [${endpoint}]:`, error);
      return { success: false, message: "Network error while updating." };
    }
  },

  /**
   * PATCH request
   */
  async patch(endpoint, body, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: buildHeaders(options.headers),
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data.message || "Patch failed",
        };
      }
      invalidateGetCache(); // Success: ensure next GETs are fresh
      return { success: true, data: data.data || data, message: data.message };
    } catch (error) {
      console.error(`API PATCH error [${endpoint}]:`, error);
      return { success: false, message: "Network error while patching." };
    }
  },

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: buildHeaders(options.headers),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data.message || "Deletion failed",
        };
      }
      invalidateGetCache(); // Success: ensure next GETs are fresh
      return { success: true, message: data.message || "Deleted successfully" };
    } catch (error) {
      console.error(`API DELETE error [${endpoint}]:`, error);
      return { success: false, message: "Network error while deleting." };
    }
  },

  /**
   * Specialized multi-part post (for uploads)
   */
  async upload(endpoint, formData, options = {}) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          ...options.headers,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Upload failed",
        };
      }
      invalidateGetCache();
      return { success: true, data: data.data || data, message: data.message };
    } catch (error) {
      console.error(`API Upload error [${endpoint}]:`, error);
      return { success: false, message: "Network error while uploading." };
    }
  },
};
