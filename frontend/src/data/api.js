import axios from "axios";

const API_URL = "https://downloadsplatform.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  verifyOTP: (data) =>
    api.post("/auth/verify-otp", data, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  updateUserDetails: (data) => api.post("/auth/update-user-details", data),
};

export default api;
