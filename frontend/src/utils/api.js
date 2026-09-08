/**
 * Centralized API & Fetch utility for Aryavarta
 * Seamlessly handles:
 * 1. Base URL routing (local dev proxy, Vercel serverless, or external backend like Render/Railway via VITE_BACKEND_URL)
 * 2. Safe response parsing (handles 405, 502, HTML error pages without crashing on JSON parsing)
 * 3. Default credentials and JSON headers
 */

export const getApiUrl = (endpoint) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (backendUrl && backendUrl.trim()) {
    return `${backendUrl.trim().replace(/\/+$/, "")}${cleanEndpoint}`;
  }
  return cleanEndpoint;
};

export const safeFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: options.credentials || "include"
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }
    }

    if (!data) {
      const text = await res.text().catch(() => "");
      if (text && text.trim().startsWith("{") && text.trim().endsWith("}")) {
        try {
          data = JSON.parse(text);
        } catch (_) {
          data = null;
        }
      }

      if (!data) {
        if (res.status === 405) {
          data = {
            success: false,
            message: "API endpoint returned 405 Method Not Allowed. Backend server might not be running or the API route is unhandled."
          };
        } else if (!res.ok) {
          data = {
            success: false,
            message: text?.slice(0, 150) || `Server error (HTTP ${res.status}: ${res.statusText})`
          };
        } else {
          data = { success: true, message: text };
        }
      }
    }

    return { res, data };
  } catch (networkError) {
    console.error(`[API Network Error] ${url}:`, networkError);
    return {
      res: { ok: false, status: 0, statusText: "Network Error" },
      data: {
        success: false,
        message: networkError.message || "Network connection error. Check if backend is reachable."
      }
    };
  }
};

export default safeFetch;
