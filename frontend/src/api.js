import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log("[api] baseURL:", baseURL);

// ✅ Create axios instance
const api = axios.create({
  baseURL,
  withCredentials: true, // ✅ VERY IMPORTANT (send cookies)
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log("[api] request:", config.method, config.url, config.data || config.params);
    return config;
  },
  (error) => {
    console.error("[api] request error:", error);
    return Promise.reject(error);
  }
);

// -----------------------------
// ✅ RESPONSE INTERCEPTOR
// -----------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // ✅ DO NOT log 401 errors for auth-related endpoints (normal on page load)
    const authEndpoints = ["/login", "/register", "/me"];
    const isAuthEndpoint = authEndpoints.some(endpoint => url.endsWith(endpoint));
    const is401OnAuthEndpoint = status === 401 && isAuthEndpoint;

    // Only log if not a 401 on auth endpoint
    if (!is401OnAuthEndpoint) {
      console.error(
        "[api] response error:",
        error?.message,
        error?.response?.status,
        error?.config?.url
      );
    }

    // ✅ DO NOT redirect if the error comes from these endpoints
    if (status === 401 && !isAuthEndpoint) {
      console.warn("Unauthorized! Redirecting to login...");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// -----------------------------
// ✅ AUTH APIs
// -----------------------------
export const registerUser = (data) => api.post("/register", data);

export const loginUser = (data) => api.post("/login", data);

export const logoutUser = () => api.post("/logout");

export const getCurrentUser = () => api.get("/me");

export const forgotPassword = (data) => api.post("/forgot-password", data);

export const resetPassword = (data) => api.post("/reset-password", data);

// -----------------------------
// ❤️ PREDICTION APIs
// -----------------------------
export const predictHeart = (data) => api.post("/predict", data);

export const getPredictionHistory = () => api.get("/prediction-history");

export const getPredictionStats = () => api.get("/stats");

export const deletePrediction = (id) => api.delete(`/delete-prediction/${id}`);

// -----------------------------
// 🤖 CHAT APIs
// -----------------------------
export const sendMessage = (data) => api.post("/chat", data);

export const getChatHistory = () => api.get("/history");

// -----------------------------
// ✅ TOKEN HELPERS
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// -----------------------------
// ✅ EXPORT INSTANCE (optional use)
export default api;