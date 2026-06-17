import { useEffect, useState, useCallback } from "react";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";
import { timeFormatter } from "../../helper/DateTimeFormat.js";
import { hr } from "framer-motion/client";
import Tabs from "./Tabs.jsx";

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
    const [queue, setQueue] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [pagination, setPagination] = useState({
        reservations: { currentPage: 1, totalPages: 1 },
        queues: { currentPage: 1, totalPages: 1 },
        schedules: { currentPage: 1, totalPages: 1 },
    });
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

                    if (!res.data.data) throw new Error("No data received");
                })
                .catch((error) => {
                    showToast("error", "Gagal", "Gagal mengambil data profil.");
                });
        }

        return () => {
            mounted = false;
        }
    }, []);

    const fetchReservations = useCallback(async () => {
        if (!token) return;
        try {
            const res = await api.get(`api/reservation?page=${pagination.reservations.currentPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setReservations(res.data.data);
            setPagination(prev => ({
                ...prev,
                reservations: {
                    currentPage: res.data.meta.current_page,
                    totalPages: res.data.meta.last_page,
                }
            }));
        } catch (err) {
            showToast("error", "gagal", "Gagal mengambil data reservasi.");
        }
    }, [token, pagination.reservations.currentPage]);

    const fetchQueues = useCallback(async () => {
        if (!token) return;
        try {
            const res = await api.get(`api/queue?page=${pagination.queues.currentPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setQueue(res.data.data);
            setPagination(prev => ({
                ...prev,
                queues: {
                    currentPage: res.data.meta.current_page,
                    totalPages: res.data.meta.last_page,
                }
            }));
        } catch (err) {
            showToast("error", "gagal", "Gagal mengambil data queue.");
        }
    }, [token, pagination.queues.currentPage]);

    const fetchSchedules = useCallback(async () => {
        try {
            const res = await api.get(`api/schedules?page=${pagination.schedules.currentPage}`);
            setSchedules(res.data.data);
            setPagination(prev => ({
                ...prev,
                schedules: {
                    currentPage: res.data.meta.current_page,
                    totalPages: res.data.meta.last_page,
                }
            }));
        } catch (err) {
            showToast("error", "gagal", "Gagal mengambil data schedule.");
        }
    }, [token, pagination.schedules.currentPage]);

    useEffect(() => {
        fetchReservations();
        fetchQueues();
        fetchSchedules();
    }, [fetchReservations, fetchQueues]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchReservations();
            fetchQueues();
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchReservations, fetchQueues]);

    const handleNextPageReservation = () => {
        if (pagination.reservations.currentPage < pagination.reservations.totalPages) {
            setPagination({
                ...pagination,
                reservations: {
                    ...pagination.reservations,
                    currentPage: pagination.reservations.currentPage + 1,
                },
            });
        }
    };

    const handlePrevPageReservation = () => {
        if (pagination.reservations.currentPage > 1) {
            setPagination({
                ...pagination,
                reservations: {
                    ...pagination.reservations,
                    currentPage: pagination.reservations.currentPage - 1,
                },
            });
        }
    };

    const handleNextPageQueue = () => {
        if (pagination.queues.currentPage < pagination.queues.totalPages) {
            setPagination({
                ...pagination,
                queues: {
                    ...pagination.queues,
                    currentPage: pagination.queues.currentPage + 1,
                }
            })
        }
    }

    const handlePrevPageQueue = () => {
        if (pagination.queues.currentPage > 1) {
            setPagination({
                ...pagination,
                queues: {
                    ...pagination.queues,
                    currentPage: pagination.queues.currentPage - 1,
                }
            })
        }
    }

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
                showToast("success", "Success", res.data.message);

            } else {
                throw new Error("No data received");
            }

        } catch (error) {
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
                showToast("success", "Success", res.data.message);
            } else {
                throw new Error("No data received");
            }

        } catch (error) {
            showToast("error", "Error", "Failed to complete queue.");
        }
    };

    const isReservationToday = (reservation) => {
        if (!reservation.created_at) return false;
        return getDateKey(reservation.created_at) === getDateKey(new Date());
    };

    return (

        <div className="container py-2 font-iosevka">
            <div className="mt-4">
                <h4>Statistics</h4>
                {stats ? (
                    <ul>
                        <li>Total reservasi pending: {stats.pending}</li>
                        <li>Total reservasi hari ini: {stats.today}</li>
                        <li>Total reservasi bulan ini: {stats.monthly}</li>
                    </ul>
                ) : (
                    <p>Loading statistics...</p>
                )}
            </div>
            <Tabs
                label1="Reservations"
                label2="Queues"
                label3="Schedule"
                label4="Doctors" //UNDER DEVELOPMENT !
                label5="Users" //UNDER DEVELOPMENT !
                children1={
                    <>
                        {reservations.length > 0 ? (
                            <>
                                <div className="mt-1">
                                    <h4>Reservations</h4>
                                </div>
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
                                        onClick={handlePrevPageReservation}
                                        disabled={pagination.reservations.currentPage === 1}>
                                        Previous
                                    </button>
                                    <span>Page {pagination.reservations.currentPage} of {pagination.reservations.totalPages}</span>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={handleNextPageReservation}
                                        disabled={pagination.reservations.currentPage === pagination.reservations.totalPages}>
                                        Next
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p>No reservations found.</p>
                        )}
                    </>
                }
                children2={
                    <>
                        <div className="mt-1">
                            <h4>Queues</h4>
                        </div>
                        {queue.length > 0 ? (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-bordered mt-3 text-center align-middle">
                                        <thead className="table-light">
                                            <tr className="text-nowrap">
                                                <th>ID</th>
                                                <th>Queue Code</th>
                                                <th>Name</th>
                                                <th>Status</th>
                                                <th>Called At</th>
                                                <th>Served At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {queue.map((item) => {
                                                return (
                                                    <tr key={item.id}>
                                                        <td className="text-nowrap">{item.id}</td>
                                                        <td className="text-nowrap">{item.queue_code}</td>
                                                        <td className="text-nowrap">{item.user.name}</td>
                                                        <td className="text-nowrap">{item.status === true ? "Done" : "Pending"}</td>
                                                        <td className="text-nowrap">{item.called_at === null ? "Not Called Yet" : timeFormatter(item.called_at)}</td>
                                                        <td className="text-nowrap">{item.served_at === null ? "Not Served Yet" : timeFormatter(item.served_at)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={handlePrevPageQueue}
                                        disabled={pagination.queues.currentPage === 1}>
                                        Previous
                                    </button>
                                    <span>Page {pagination.queues.currentPage} of {pagination.queues.totalPages}</span>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={handleNextPageQueue}
                                        disabled={pagination.queues.currentPage === pagination.queues.totalPages}>
                                        Next
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p>No Queue found.</p>
                        )}
                    </>
                }
                children3={<>
                    <div className="mt-1">
                        <h4>Schedules</h4>
                    </div>
                    {schedule.length > 0 ? (
                        <>
                            <div className="table-responsive">
                                <table className="table table-bordered mt-3 text-center align-middle">
                                    <thead className="table-light">
                                        <tr className="text-nowrap">
                                            <th>ID</th>
                                            <th>Queue Code</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Called At</th>
                                            <th>Served At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {queue.map((item) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td className="text-nowrap">{item.id}</td>
                                                    <td className="text-nowrap">{item.queue_code}</td>
                                                    <td className="text-nowrap">{item.user.name}</td>
                                                    <td className="text-nowrap">{item.status === true ? "Done" : "Pending"}</td>
                                                    <td className="text-nowrap">{item.called_at === null ? "Not Called Yet" : timeFormatter(item.called_at)}</td>
                                                    <td className="text-nowrap">{item.served_at === null ? "Not Served Yet" : timeFormatter(item.served_at)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={handlePrevPageQueue}
                                    disabled={pagination.queues.currentPage === 1}>
                                    Previous
                                </button>
                                <span>Page {pagination.queues.currentPage} of {pagination.queues.totalPages}</span>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={handleNextPageQueue}
                                    disabled={pagination.queues.currentPage === pagination.queues.totalPages}>
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <p>No Queue found.</p>
                    )}
                </>
                }
                children4={
                    <div className="mt-1">
                        <h4>Doctors</h4>
                        <p className="text-muted">Doctors Page is under development !</p>
                    </div>
                }
                children5={
                    <div className="mt-1">
                        <h4>Users</h4>
                        <p className="text-muted">Users Page is under development !</p>
                    </div>
                }
            />
        </div>
    );
}
