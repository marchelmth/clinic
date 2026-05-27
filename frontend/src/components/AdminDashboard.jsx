import { useEffect, useState } from "react";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";
import { ol } from "framer-motion/client";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("auth_token");



    useEffect(() => {
        let mounted = true;

        api.get("/api/admin/stats")
            .then((res) => {
                if (mounted && res) {
                    const statsData = res.data;
                    setStats(statsData);
                }

                if (!res.data) throw new Error("No data received");
            })
            .catch((error) => {
                console.error("Error fetching profile:", error);
                showToast("error", "Gagal", "Gagal mengambil data profil.");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        if (token) {
            api.get("api/reservation", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (mounted && res.data) {
                        const reservationsData = res.data.data;
                        setReservations(reservationsData);
                        console.log("Reservations data:", reservationsData);
                    }

                    if (!res.data.data) throw new Error("No data received");
                })
                .catch((error) => {
                    console.error("Error fetching reservations:", error);
                    showToast("error", "Gagal", "Gagal mengambil data reservasi.");
                })
                .finally(() => {
                    if (mounted) setLoading(false);
                });
            return () => {
                mounted = false;
            };
        }
    }, [token]);

    const handleStatusChange = async (reservationId, status) => {
        try {
            let endpoint = "";

            if (status === "approve") {
                endpoint = `/api/reservations/${reservationId}/approve`;
            } else if (status === "reject") {
                endpoint = `/api/reservations/${reservationId}/reject`;
            } else if (status === "cancel") {
                endpoint = `/api/reservations/${reservationId}/cancel`;
            } else {
                return;
            }

            const res = await api.post(endpoint, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                console.log(res.data)
                showToast("success", "Success", res.data.message);
            } else {
                throw new Error("No data received");
            }

        } catch (error) {
            console.error("Error changing status:", error);
            showToast("error", "Error", "Failed to change status.");
        }
    };

    return (
        <div className="container py-2 font-iosevka">
            {stats ? (
                <div className="mt-4">
                    <h4>Statistics</h4>
                    <ul>
                        <li>Total reservasi pending: {stats.pending}</li>
                        <li>Total reservasi hari ini: {stats.today}</li>
                        <li>Total reservasi bulan ini: {stats.total}</li>
                    </ul>
                </div>
            ) : (
                <p>Loading statistics...</p>
            )}

            {reservations.length > 0 ? (
                <>
                    <h4>Reservations</h4>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Nama Pasien</th>
                                <th>Keluhan</th>
                                <th>Nama Dokter</th>
                                <th>Spesialis</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation) => (
                                <tr key={reservation.id}>
                                    <td>{reservation.user.name}</td>
                                    <td>{reservation.keluhan}</td>
                                    <td>dr. {reservation.schedule.doctor.name}</td>
                                    <td>{reservation.schedule.doctor.specialization}</td>
                                    <td>
                                        <select
                                            className="form-select"
                                            name="status"
                                            id={`status-${reservation.id}`}
                                            value={reservation.status}
                                            onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                                            disabled={reservation.status === "cancelled"}
                                        >
                                            <option value="pending" disabled hidden>Pending</option>
                                            <option value="approved" disabled hidden>Approved</option>
                                            <option value="rejected" disabled hidden>Rejected</option>
                                            <option value="cancelled" disabled hidden>Cancelled</option>

                                            {reservation.status === "pending" && (
                                                <>
                                                    <option value="approve">Approve</option>
                                                    <option value="reject">Reject</option>
                                                    <option value="cancel">Cancel</option>
                                                </>
                                            )}

                                            {reservation.status === "approved" && (
                                                <option value="cancel">Cancel</option>
                                            )}

                                            {reservation.status === "rejected" && (
                                                <option value="approve">Approve</option>
                                            )}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <p>No reservations found.</p>
            )}
        </div>
    );
}