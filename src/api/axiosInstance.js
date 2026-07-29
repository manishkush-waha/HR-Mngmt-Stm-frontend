import axios from "axios";


let apiUrl = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
  baseURL: `${apiUrl}/api`,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          const res = await axios.post(`${apiUrl}/api/auth/token/refresh/`, refresh);

          localStorage.setItem("access", res.data.access);

          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

          return API(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;