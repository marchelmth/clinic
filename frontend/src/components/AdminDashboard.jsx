import { useEffect, useState } from "react";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";
import { timeFormatter } from "../../helper/DateTimeFormat.js";

const TIME_ZONE = "Asia/Makassar";
const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

const getDateKey = (value) => dateKeyFormatter.format(new Date(value));

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const token = localStorage.getItem("auth_token");

    useEffect(() => {
        let mounted = true;

        if (token) {
            api.get("/api/admin/stats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (mounted && res.data) {
                        setStats(res.data.data);
                    }

                    console.log("Fetched dashboard stats:", res.data.data);

                    if (!res.data.data) throw new Error("No data received");
                })
                .catch((error) => {
                    console.error("Error fetching profile:", error);
                    showToast("error", "Gagal", "Gagal mengambil data profil.");
                });
        }

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
            let newStatus = "";

            if (status === "approve") {
                endpoint = `/api/reservations/${reservationId}/approve`;
                newStatus = "approved";
            } else if (status === "reject") {
                endpoint = `/api/reservations/${reservationId}/reject`;
                newStatus = "rejected";
            } else if (status === "cancel") {
                endpoint = `/api/reservations/${reservationId}/cancel`;
                newStatus = "cancelled";
            } else {
                return;
            }

            const res = await api.post(endpoint, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                setReservations((prevReservations) =>
                    prevReservations.map((reservation) =>
                        reservation.id === reservationId
                            ? { ...reservation, status: newStatus }
                            : reservation
                    )
                );

                console.log(res.data)
                showToast("success", "Success", res.data.message);

            } else {
                throw new Error("No data received");
            }

        } catch (error) {
            console.error("Error changing status:", error);
            showToast("error", "Error", error.message || "Failed to change status.");
        }
    };

    const handleCompleteQueue = async (queueId) => {
        try {
            const res = await api.put(`/api/queues/${queueId}/complete`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                setReservations((prevReservations) =>
                    prevReservations.map((reservation) =>
                        reservation.queue && reservation.queue.id === queueId
                            ? { ...reservation, queue: { ...reservation.queue, status: 1 } }
                            : reservation
                    )
                );

                console.log(res.data)
                showToast("success", "Success", res.data.message);
            } else {
                throw new Error("No data received");
            }

        } catch (error) {
            console.error("Error completing queue:", error);
            showToast("error", "Error", "Failed to complete queue.");
        }
    };

    const isReservationToday = (reservation) => {
        if (!reservation.created_at) return false;
        return getDateKey(reservation.created_at) === getDateKey(new Date());
    };

    return (
        <div className="container py-2 font-iosevka">
            {stats ? (
                <div className="mt-4">
                    <h4>Statistics</h4>
                    <ul>
                        <li>Total reservasi pending: {stats.pending}</li>
                        <li>Total reservasi hari ini: {stats.today}</li>
                        <li>Total reservasi bulan ini: {stats.monthly}</li>
                    </ul>
                </div>
            ) : (
                <p>Loading statistics...</p>
            )}

            {reservations.length > 0 ? (
                <>
                    <h4>Reservations</h4>
                    <div className="table-responsive">
                        <table className="table table-bordered mt-3 text-center align-middle">
                            <thead className="table-light">
                                <tr className="text-nowrap">
                                    <th>ID</th>
                                    <th>Nama Pasien</th>
                                    <th>Keluhan</th>
                                    <th>Nama Dokter</th>
                                    <th>Spesialis</th>
                                    <th>Status</th>
                                    <th>Selesai dilayani</th>
                                    <th>Waktu Reservasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((reservation) => {
                                    const isToday = isReservationToday(reservation);
                                    const isDisabled = !isToday;

                                    return (
                                        <tr key={reservation.id} className={isDisabled ? "text-muted" : ""}>
                                            <td className="text-nowrap">{reservation.id}</td>
                                            <td className="text-nowrap">{reservation.user.name}</td>
                                            <td>{reservation.keluhan}</td>
                                            <td className="text-nowrap">dr. {reservation.schedule.doctor.name}</td>
                                            <td className="text-nowrap">{reservation.schedule.doctor.specialization}</td>
                                            <td>
                                                <select
                                                    className={`form-select ${isDisabled ? "text-muted bg-body-secondary" : ""}`}
                                                    name="status"
                                                    id={`status-${reservation.id}`}
                                                    value={reservation.status}
                                                    onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                                                    disabled={isDisabled || reservation.status === "cancelled"}
                                                    style={{ minWidth: "120px" }}
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
                                                        <option value="">Approved</option>
                                                    )}

                                                    {reservation.status === "rejected" && (
                                                        <>
                                                            <option value="approve">Approve</option>
                                                            <option value="">Rejected</option>
                                                        </>

                                                    )}
                                                </select>
                                            </td>
                                            <td className="text-nowrap">{reservation.queue ? (
                                                reservation.queue.status === 1 ? (
                                                    <span className={isDisabled ? "text-muted" : "badge bg-success"}>Done</span>
                                                ) : (
                                                    <button
                                                        className={`btn btn-sm ${isDisabled ? "btn-outline-secondary text-muted" : "btn-success"}`}
                                                        onClick={() => handleCompleteQueue(reservation.queue.id)}
                                                        disabled={isDisabled}
                                                    >
                                                        Mark as Done
                                                    </button>
                                                )
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}</td>
                                            <td className="text-nowrap">{timeFormatter(reservation.created_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

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
