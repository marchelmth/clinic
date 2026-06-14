import axios from "axios";
import { showToast } from "../utils/toast";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

console.log("Base URL:", apiBaseUrl);

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