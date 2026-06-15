import axios from "axios";
import { showToast } from "../utils/toast";

const isProduction = import.meta.env.VITE_ENVIRONMENT === "production";

const apiBaseUrl = isProduction ? import.meta.env.VITE_API_BASE_URL : import.meta.env.VITE_API_BASE_URL_DEVELOPMENT;

console.log(import.meta.env);
console.log(isProduction);
console.log(apiBaseUrl);

const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
});

api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("auth_token");

            showToast("error", "Unauthorized", "Sesi Anda telah berakhir. Silakan login kembali.");

            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;