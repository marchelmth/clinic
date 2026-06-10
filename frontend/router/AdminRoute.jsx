import { useEffect } from "react";

export default function AdminRoute({ children }) {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("role");

    useEffect(() => {
        console.log("AdminRoute Check: token =", token, ", role =", role);
        if (!token || role !== "admin") {
            console.log("Redirecting to / because condition failed.");
            window.location.href = "/";
        }
    }, [token, role]);

    if (!token || role !== "admin") {
        console.log("Returning null because condition failed.");
        return null;
    }

    return children;
}
