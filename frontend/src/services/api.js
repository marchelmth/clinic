import axios from "axios";

const apiBaseUrl = "http://localhost:3000";

const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
});

export default api;