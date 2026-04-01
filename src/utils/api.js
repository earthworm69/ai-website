export const BASE_URL = import.meta.env.VITE_API_URL || "https://ai-website-backend-production.up.railway.app";
console.log("API Base URL:", BASE_URL);

/**
 * Helper to get the auth token from localStorage.
 */
export const getToken = () => localStorage.getItem("token");

/**
 * Wrapper for authenticated fetch calls.
 * Automatically adds the Authorization header and handles 401 errors.
 */
export const authFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
};
