import { useEffect } from "react";

export default function AdminRoute({ children }) {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (!token || role !== "admin") {
            window.location.href = "/";
        }
    }, [token, role]);

    if (!token || role !== "admin") {
        return null;
    }

    return children;
}
