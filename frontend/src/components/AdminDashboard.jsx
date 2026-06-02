import { useEffect, useState } from "react";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";
import { ol } from "framer-motion/client";
import { timeFormatter } from "../../helper/DateTimeFormat.js";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const token = localStorage.getItem("auth_token");

    useEffect(() => {
        let mounted = true;

        api.get("/api/admin/stats")
            .then((res) => {
                if (mounted && res) {
                    setStats(res.data);
                }

                if (!res.data) throw new Error("No data received");
            })
            .catch((error) => {
                console.error("Error fetching profile:", error);
                showToast("error", "Gagal", "Gagal mengambil data profil.");
            });

        return () => {
            mounted = false;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        if (token) {
            setLoading(true);
            api.get(`api/reservation?page=${currentPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (mounted && res.data) {
                        setReservations(res.data.data);
                        setCurrentPage(res.data.meta.current_page);
                        setTotalPages(res.data.meta.last_page);
                        console.log("Reservations data:", res.data.data); // development only !!
                    }

                    if (!res.data.data) throw new Error("Error occured while fetching reservations");
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
    }, [token, currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

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
                    <table className="table table-bordered mt-3 text-center">
                        <thead>
                            <tr>
                                <th>Nama Pasien</th>
                                <th>Keluhan</th>
                                <th>Nama Dokter</th>
                                <th>Spesialis</th>
                                <th>Status</th>
                                <th>Waktu Reservasi</th>
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
                                    <td>{timeFormatter(reservation.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button
                            className="btn btn-outline-primary"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            className="btn btn-outline-primary"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p>No reservations found.</p>
            )}
        </div>
    );
}