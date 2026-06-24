import { useEffect, useState, useCallback } from "react";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";
import { timeFormatter } from "../../helper/DateTimeFormat.js";
import Tabs from "./Tabs.jsx";
import Form from "./Form.jsx";
import { For } from "@chakra-ui/react";

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
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [showDoctorForm, setShowDoctorForm] = useState(false);
    const [showEditScheduleForm, setShowEditScheduleForm] = useState(false);
    const [showEditDoctorForm, setShowEditDoctorForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [showEditUserForm, setShowEditUserForm] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [users, setUsers] = useState([]);
    const [newDoctor, setNewDoctor] = useState({
        name: "",
        email: "",
        password: "",
        specialization: "",
        phone: "",
        status: "",
        room: ""
    });
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "user"
    });
    const [newSchedule, setNewSchedule] = useState({
        doctor_id: "",
        date: "",
        start_time: "",
        end_time: "",
        quota: ""
    });
    const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
    const [isSubmittingDoctor, setIsSubmittingDoctor] = useState(false);
    const [isSubmittingUser, setIsSubmittingUser] = useState(false);
    const [isEditingSchedule, setIsEditingSchedule] = useState(false);
    const [isEditingDoctor, setIsEditingDoctor] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState(null);
    const [editedDoctor, setEditedDoctor] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const [pagination, setPagination] = useState({
        reservations: { currentPage: 1, totalPages: 1 },
        queues: { currentPage: 1, totalPages: 1 },
        schedules: { currentPage: 1, totalPages: 1 },
        doctors: { currentPage: 1, totalPages: 1 },
        users: { currentPage: 1, totalPages: 1 },
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
            const res = await api.get(`api/schedules?page=${pagination.schedules.currentPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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

    const fetchDoctor = useCallback(async () => {
        try {
            const res = await api.get(`api/doctors/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDoctors(res.data.data || []);
        } catch (err) {
            showToast("error", "gagal", "Gagal mengambil data doctor.");
        }
    }, [token]);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get(`api/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(res.data.data || []);
        } catch (err) {
            showToast("error", "gagal", "Gagal mengambil data users.");
        }
    }, [token]);

    useEffect(() => {
        fetchReservations();
        fetchQueues();
        fetchSchedules();
        fetchDoctor();
        fetchUsers();
    }, [fetchReservations, fetchQueues, fetchSchedules, fetchDoctor, fetchUsers]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchReservations();
            fetchQueues();
            fetchSchedules();
            fetchDoctor();
            fetchUsers();
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchReservations, fetchQueues, fetchSchedules, fetchDoctor, fetchUsers]);

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

    const handleNextPageSchedule = () => {
        if (pagination.schedules.currentPage < pagination.schedules.totalPages) {
            setPagination({
                ...pagination,
                schedules: {
                    ...pagination.schedules,
                    currentPage: pagination.schedules.currentPage + 1,
                }
            })
        }
    }

    const handlePrevPageSchedule = () => {
        if (pagination.schedules.currentPage > 1) {
            setPagination({
                ...pagination,
                schedules: {
                    ...pagination.schedules,
                    currentPage: pagination.schedules.currentPage - 1,
                }
            })
        }
    }

    const handleNextPageDoctor = () => {
        if (pagination.doctors.currentPage < pagination.doctors.totalPages) {
            setPagination({
                ...pagination,
                doctors: {
                    ...pagination.doctors,
                    currentPage: pagination.doctors.currentPage + 1,
                }
            })
        }
    }

    const handlePrevPageDoctor = () => {
        if (pagination.doctors.currentPage > 1) {
            setPagination({
                ...pagination,
                doctors: {
                    ...pagination.doctors,
                    currentPage: pagination.doctors.currentPage - 1,
                }
            })
        }
    }

    const handleNextPageUser = () => {
        if (pagination.users.currentPage < pagination.users.totalPages) {
            setPagination({
                ...pagination,
                users: {
                    ...pagination.users,
                    currentPage: pagination.users.currentPage + 1,
                }
            })
        }
    }

    const handlePrevPageUser = () => {
        if (pagination.users.currentPage > 1) {
            setPagination({
                ...pagination,
                users: {
                    ...pagination.users,
                    currentPage: pagination.users.currentPage - 1,
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

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        setIsSubmittingSchedule(true);
        try {
            const res = await api.post('/api/schedules', newSchedule, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                showToast("success", "Success", res.data.message || "Schedule created successfully");
                setShowScheduleForm(false);
                fetchSchedules(); // Refresh table
                setNewSchedule({ doctor_id: "1", date: "", start_time: "", end_time: "", quota: "" }); // Reset form
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            showToast("error", "Error", error.response?.data?.message || error.message || "Failed to create schedule.");
        } finally {
            setIsSubmittingSchedule(false);
        }
    }

    const handleCreateDoctors = async (e) => {
        e.preventDefault();
        setIsSubmittingDoctor(true);
        try {
            const res = await api.post('/api/doctors', newDoctor, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                showToast("success", "Success", res.data.message || "Doctor created successfully");
                setShowDoctorForm(false);
                fetchDoctor(); // Refresh table
                setNewDoctor({ name: "", email: "", specialization: "", phone: "", status: "", room: "" }); // Reset form
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            showToast("error", "Error", error.response?.data?.message || error.message || "Failed to create doctor.");
        } finally {
            setIsSubmittingDoctor(false);
        }
    }

    const handleEditSchedule = (schedule) => {
        setEditedSchedule({
            id: schedule.id,
            doctor_id: schedule.doctor_id || schedule.doctor?.id || "",
            date: schedule.date || "",
            start_time: schedule.start_time ? schedule.start_time.slice(0, 5) : "",
            end_time: schedule.end_time ? schedule.end_time.slice(0, 5) : "",
            quota: schedule.quota || ""
        });
        setShowEditScheduleForm(true);
        setShowScheduleForm(false);
    }

    const handleEditDoctor = (doctor) => {
        setEditedDoctor({
            id: doctor.id,
            name: doctor.name || "",
            email: doctor.email || "",
            specialization: doctor.specialization || "",
            phone: doctor.phone || "",
            room: doctor.room || "",
            status: doctor.status || ""
        });
        setShowEditDoctorForm(true);
        setShowDoctorForm(false);
    }

    const submitEditDoctor = async (e) => {
        e.preventDefault();
        setIsEditingDoctor(true);
        try {
            const res = await api.put(`/api/doctors/${editedDoctor.id}`, editedDoctor, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                showToast("success", "Success", res.data.message || "Doctor updated successfully");
                setShowEditDoctorForm(false);
                setEditedDoctor(null);
                fetchDoctor();
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            showToast("error", "Error", error.response?.data?.message || error.message || "Failed to update doctor.");
        } finally {
            setIsEditingDoctor(false);
        }
    }

    const handleDeleteDoctor = async (doctorId) => {
        try {
            const res = await api.delete(`/api/doctors/${doctorId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                showToast("success", "Success", res.data.message || "Doctor deleted successfully");
                fetchDoctor(); // Refresh table
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            showToast("error", "Error", error.response?.data?.message || error.message || "Failed to delete doctor.");
        }
    }

    // ========== USER HANDLERS ==========
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsSubmittingUser(true);
        try {
            const res = await api.post('/api/users', newUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                showToast("success", "Success", res.data.message || "User created successfully");
                setShowUserForm(false);
                fetchUsers();
                setNewUser({ name: "", email: "", password: "", role: "user" });
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            showToast("error", "Error", error.response?.data?.message || error.message || "Failed to create user.");
        } finally {
            setIsSubmittingUser(false);
        }
    }

    const handleEditUser = (user) => {
        setEditedUser({
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            role: user.role || "user",
            password: ""
        });
        setShowEditUserForm(true);
        setShowUserForm(false);
    }

    const submitEditUser = async (e) => {
        e.preventDefault();
        setIsEditingUser(true);
        try {
            const payload = { ...editedUser };
            if (!payload.password) {
                delete payload.password;
            }
            const res = await api.put(`/api/users/${editedUser.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                showToast("success", "Success", res.data.message || "User updated successfully");
                setShowEditUserForm(false);
                setEditedUser(null);
                fetchUsers();
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            showToast("error", "Error", error.response?.data?.message || error.message || "Failed to update user.");
        } finally {
            setIsEditingUser(false);
        }
    }

    const handleDeleteUser = async (userId) => {
        try {
            const res = await api.delete(`/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                showToast("success", "Success", res.data.message || "User deleted successfully");
                fetchUsers();
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            showToast("error", "Error", error.response?.data?.message || error.message || "Failed to delete user.");
        }
    }

    const submitEditSchedule = async (e) => {
        e.preventDefault();
        setIsEditingSchedule(true);
        try {
            const res = await api.put(`/api/schedules/${editedSchedule.id}`, editedSchedule, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                showToast("success", "Success", res.data.message || "Schedule updated successfully");
                setShowEditScheduleForm(false);
                setEditedSchedule(null);
                fetchSchedules();
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            showToast("error", "Error", error.response?.data?.message || error.message || "Failed to update schedule.");
        } finally {
            setIsEditingSchedule(false);
        }
    }

    const handleDeleteSchedule = async (scheduleId) => {
        try {
            const res = await api.delete(`/api/schedule/${scheduleId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data) {
                showToast("success", "Success", res.data.message || "Schedule deleted successfully");
                fetchSchedules(); // Refresh table
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            showToast("error", "Error", error.response?.data?.message || error.message || "Failed to delete schedule.");
        }
    }

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
                label3="Schedule" // UNDER DEVELOPMENT !
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
                    <div className="mt-1 d-flex justify-content-between align-items-center">
                        <h4>Schedules</h4>
                        <button
                            className={`btn ${showScheduleForm ? 'btn-secondary' : 'btn-success'}`}
                            onClick={() => {
                                setShowScheduleForm(!showScheduleForm);
                                setShowEditScheduleForm(false);
                            }}
                        >
                            {showScheduleForm ? 'Batal' : 'Create Schedule'}
                        </button>
                    </div>
                    {showEditScheduleForm && editedSchedule ? (
                        <div className="card p-4 mt-3 shadow-sm border-warning">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="mb-0">Edit Jadwal</h5>
                                <button className="btn-close" onClick={() => setShowEditScheduleForm(false)}></button>
                            </div>
                            <Form
                                id="edit-schedule-form"
                                onSubmit={submitEditSchedule}
                                submitText="Update Jadwal"
                                loadingText="Menyimpan..."
                                isSubmitting={isEditingSchedule}
                            >
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Pilih Dokter</label>
                                    <select
                                        className="form-select bg-body-secondary"
                                        value={editedSchedule.doctor_id}
                                        onChange={(e) => setEditedSchedule({ ...editedSchedule, doctor_id: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Pilih Dokter...</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.id}>
                                                dr. {doctor.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-medium">Tanggal / Hari</label>
                                    <input
                                        type="text"
                                        className="form-control bg-body-secondary"
                                        placeholder="Contoh: Senin - Rabu atau Kamis - Sabtu"
                                        value={editedSchedule.date}
                                        onChange={(e) => setEditedSchedule({ ...editedSchedule, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-medium">Waktu Mulai</label>
                                        <input
                                            type="time"
                                            className="form-control bg-body-secondary"
                                            value={editedSchedule.start_time}
                                            onChange={(e) => setEditedSchedule({ ...editedSchedule, start_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-medium">Waktu Selesai</label>
                                        <input
                                            type="time"
                                            className="form-control bg-body-secondary"
                                            value={editedSchedule.end_time}
                                            onChange={(e) => setEditedSchedule({ ...editedSchedule, end_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-medium">Kuota</label>
                                        <input
                                            type="number"
                                            className="form-control bg-body-secondary"
                                            placeholder="Contoh: 10"
                                            value={editedSchedule.quota}
                                            onChange={(e) => setEditedSchedule({ ...editedSchedule, quota: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </Form>
                        </div>
                    ) : showScheduleForm ? (
                        <div className="card p-4 mt-3 shadow-sm">
                            <h5 className="mb-4">Buat Jadwal Baru</h5>
                            <Form
                                id="create-schedule-form"
                                onSubmit={handleCreateSchedule}
                                submitText="Simpan Jadwal"
                                loadingText="Menyimpan..."
                                isSubmitting={isSubmittingSchedule}
                            >
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Pilih Dokter</label>
                                    <select
                                        className="form-select bg-body-secondary"
                                        value={newSchedule.doctor_id}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, doctor_id: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Pilih Dokter...</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.id}>
                                                dr. {doctor.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-medium">Tanggal / Hari</label>
                                    <input
                                        type="text"
                                        className="form-control bg-body-secondary"
                                        placeholder="Contoh: Senin - Rabu atau Kamis - Sabtu"
                                        value={newSchedule.date}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-medium">Waktu Mulai</label>
                                        <input
                                            type="time"
                                            className="form-control bg-body-secondary"
                                            value={newSchedule.start_time}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-medium">Waktu Selesai</label>
                                        <input
                                            type="time"
                                            className="form-control bg-body-secondary"
                                            value={newSchedule.end_time}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-medium">Kuota</label>
                                        <input
                                            type="number"
                                            className="form-control bg-body-secondary"
                                            placeholder="Contoh: 10"
                                            value={newSchedule.quota}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, quota: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </Form>
                        </div>
                    ) : schedules.length > 0 ? (
                        <>
                            <div className="table-responsive">
                                <table className="table table-bordered mt-3 text-center align-middle">
                                    <thead className="table-light">
                                        <tr className="text-nowrap">
                                            <th>ID</th>
                                            <th>Doctor</th>
                                            <th>Date</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>Quota</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map((item) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td className="text-nowrap">{item.id}</td>
                                                    <td className="text-nowrap">{item.doctor.name}</td>
                                                    <td className="text-nowrap">{item.date}</td>
                                                    <td className="text-nowrap">{item.start_time}</td>
                                                    <td className="text-nowrap">{item.end_time}</td>
                                                    <td className="text-nowrap">{item.quota > 0 ? item.quota : "-"}</td>
                                                    <td className="text-nowrap">
                                                        <button className="btn btn-danger btn-sm w-25" onClick={() => handleDeleteSchedule(item.id)}>Delete</button>
                                                        <button className="btn btn-warning btn-sm w-25 ms-2" onClick={() => handleEditSchedule(item)}>Edit</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={handlePrevPageSchedule}
                                    disabled={pagination.schedules.currentPage === 1}>
                                    Previous
                                </button>
                                <span>Page {pagination.schedules.currentPage} of {pagination.schedules.totalPages}</span>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={handleNextPageSchedule}
                                    disabled={pagination.schedules.currentPage === pagination.schedules.totalPages}>
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <p>No Schedules found.</p>
                    )}
                </>
                }
                children4={
                    <div className="mt-1">
                        <div className="mt-1 d-flex justify-content-between align-items-center">
                            <h4 className="me-2">Doctors</h4>
                            <button
                                className={`btn ${showDoctorForm ? 'btn-secondary' : 'btn-success'}`}
                                onClick={() => {
                                    setShowDoctorForm(!showDoctorForm);
                                    setShowEditDoctorForm(false);
                                }}
                            >
                                {showDoctorForm ? 'Batal' : 'Create Doctor'}
                            </button>
                        </div>

                        {showEditDoctorForm && editedDoctor ? (
                            <div className="card p-4 mt-3 shadow-sm border-warning">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="mb-0">Edit Dokter</h5>
                                    <button className="btn-close" onClick={() => setShowEditDoctorForm(false)}></button>
                                </div>
                                <Form
                                    id="edit-doctor-form"
                                    onSubmit={submitEditDoctor}
                                    submitText="Update Dokter"
                                    loadingText="Menyimpan..."
                                    isSubmitting={isEditingDoctor}
                                >
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Nama Dokter</label>
                                        <input
                                            type="text"
                                            className="form-control bg-body-secondary"
                                            placeholder="Nama dokter"
                                            value={editedDoctor.name}
                                            onChange={(e) => setEditedDoctor({ ...editedDoctor, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Spesialisasi</label>
                                        <input
                                            type="text"
                                            className="form-control bg-body-secondary"
                                            placeholder="Contoh: Dokter Umum"
                                            value={editedDoctor.specialization}
                                            onChange={(e) => setEditedDoctor({ ...editedDoctor, specialization: e.target.value })}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-medium">Telepon</label>
                                            <input
                                                type="number"
                                                className="form-control bg-body-secondary"
                                                placeholder="No. Telepon"
                                                value={editedDoctor.phone}
                                                onChange={(e) => setEditedDoctor({ ...editedDoctor, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-medium">Status</label>
                                            <select
                                                name="status"
                                                id={`status-${editedDoctor.id}`}
                                                className="form-select bg-body-secondary"
                                                value={editedDoctor.status ? editedDoctor.status.toLowerCase() : ""}
                                                onChange={(e) => setEditedDoctor({ ...editedDoctor, status: e.target.value })}
                                            >
                                                <option value="" disabled>Pilih status</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        ) : showDoctorForm ? (
                            <div className="card p-4 mt-3 shadow-sm">
                                <h5 className="mb-4">Tambah Dokter Baru</h5>
                                <Form
                                    id="create-doctor-form"
                                    onSubmit={handleCreateDoctors}
                                    submitText="Simpan Dokter"
                                    loadingText="Menyimpan..."
                                    isSubmitting={isSubmittingDoctor}
                                >
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Nama Dokter</label>
                                        <input
                                            type="text"
                                            className="form-control bg-body-secondary"
                                            placeholder="Nama dokter"
                                            value={newDoctor.name}
                                            onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Spesialisasi</label>
                                        <input
                                            type="text"
                                            className="form-control bg-body-secondary"
                                            placeholder="Contoh: Dokter Umum (kosongkan jika umum)"
                                            value={newDoctor.specialization}
                                            onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-medium">Telepon</label>
                                            <input
                                                type="number"
                                                className="form-control bg-body-secondary"
                                                placeholder="No. Telepon"
                                                value={newDoctor.phone}
                                                onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-medium">Status</label>
                                            <select
                                                name="status"
                                                className="form-select bg-body-secondary"
                                                value={newDoctor.status}
                                                onChange={(e) => setNewDoctor({ ...newDoctor, status: e.target.value })}
                                            >
                                                <option value="" disabled>Pilih status</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        ) : doctors.length > 0 ? (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-bordered mt-3 text-center align-middle">
                                        <thead className="table-light">
                                            <tr className="text-nowrap">
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Specialization</th>
                                                <th>Status</th>
                                                <th>Phone</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {doctors.map((item) => {
                                                return (
                                                    <tr key={item.id}>
                                                        <td className="text-nowrap">{item.id}</td>
                                                        <td className="text-nowrap">{item.name}</td>
                                                        <td className="text-nowrap">{item.specialization}</td>
                                                        <td className="text-nowrap">{item.status}</td>
                                                        <td className="text-nowrap">{item.phone}</td>
                                                        <td>
                                                            <button className="btn btn-danger btn-sm w-25" onClick={() => handleDeleteDoctor(item.id)}>Delete</button>
                                                            <button className="btn btn-warning btn-sm w-25 ms-2" onClick={() => handleEditDoctor(item)}>Edit</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={handlePrevPageDoctor}
                                        disabled={pagination.doctors.currentPage === 1}>
                                        Previous
                                    </button>
                                    <span>Page {pagination.doctors.currentPage} of {pagination.doctors.totalPages}</span>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={handleNextPageDoctor}
                                        disabled={pagination.doctors.currentPage === pagination.doctors.totalPages}>
                                        Next
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p>No Doctors found.</p>
                        )}
                    </div>
                }
                children5={
                    <div className="mt-1">
                        <div className="mt-1 d-flex justify-content-between align-items-center">
                            <h4 className="me-2">Users</h4>
                            <button
                                className={`btn ${showUserForm ? 'btn-secondary' : 'btn-success'}`}
                                onClick={() => {
                                    setShowUserForm(!showUserForm);
                                    setShowEditUserForm(false);
                                }}
                            >
                                {showUserForm ? 'Batal' : 'Create User'}
                            </button>
                        </div>

                        {showEditUserForm && editedUser ? (
                            <div className="card p-4 mt-3 shadow-sm border-warning">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="mb-0">Edit User</h5>
                                    <button className="btn-close" onClick={() => setShowEditUserForm(false)}></button>
                                </div>
                                <Form
                                    id="edit-user-form"
                                    onSubmit={submitEditUser}
                                    submitText="Update User"
                                    loadingText="Menyimpan..."
                                    isSubmitting={isEditingUser}
                                >
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Nama</label>
                                        <input
                                            type="text"
                                            className="form-control bg-body-secondary"
                                            placeholder="Nama user"
                                            value={editedUser.name}
                                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Email</label>
                                        <input
                                            type="email"
                                            className="form-control bg-body-secondary"
                                            placeholder="Email user"
                                            value={editedUser.email}
                                            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-medium">Role</label>
                                            <select
                                                name="role"
                                                className="form-select bg-body-secondary"
                                                value={editedUser.role}
                                                onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-medium">Password Baru</label>
                                            <input
                                                type="password"
                                                className="form-control bg-body-secondary"
                                                placeholder="Kosongkan jika tidak diubah"
                                                value={editedUser.password}
                                                onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        ) : showUserForm ? (
                            <div className="card p-4 mt-3 shadow-sm">
                                <h5 className="mb-4">Tambah User Baru</h5>
                                <Form
                                    id="create-user-form"
                                    onSubmit={handleCreateUser}
                                    submitText="Simpan User"
                                    loadingText="Menyimpan..."
                                    isSubmitting={isSubmittingUser}
                                >
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Nama</label>
                                        <input
                                            type="text"
                                            className="form-control bg-body-secondary"
                                            placeholder="Nama user"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Email</label>
                                        <input
                                            type="email"
                                            className="form-control bg-body-secondary"
                                            placeholder="Email user"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-medium">Password</label>
                                            <input
                                                type="password"
                                                className="form-control bg-body-secondary"
                                                placeholder="Min. 8 karakter"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-medium">Role</label>
                                            <select
                                                name="role"
                                                className="form-select bg-body-secondary"
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        ) : users.length > 0 ? (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-bordered mt-3 text-center align-middle">
                                        <thead className="table-light">
                                            <tr className="text-nowrap">
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Email Verified</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((item) => {
                                                return (
                                                    <tr key={item.id}>
                                                        <td className="text-nowrap">{item.id}</td>
                                                        <td className="text-nowrap">{item.name}</td>
                                                        <td className="text-nowrap">{item.email}</td>
                                                        <td className="text-nowrap">
                                                            <span className={`badge ${item.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                                {item.role}
                                                            </span>
                                                        </td>
                                                        <td className="text-nowrap">
                                                            {item.email_verified_at ? (
                                                                <span className="badge bg-success">Verified</span>
                                                            ) : (
                                                                <span className="badge bg-warning text-dark">Unverified</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-danger btn-sm w-15" onClick={() => handleDeleteUser(item.id)}>Delete</button>
                                                            <button className="btn btn-warning btn-sm w-25 ms-2" onClick={() => handleEditUser(item)}>Edit</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={handlePrevPageUser}
                                        disabled={pagination.users.currentPage === 1}>
                                        Previous
                                    </button>
                                    <span>Page {pagination.users.currentPage} of {pagination.users.totalPages}</span>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={handleNextPageUser}
                                        disabled={pagination.users.currentPage === pagination.users.totalPages}>
                                        Next
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p>No Users found.</p>
                        )}
                    </div>
                }
            />
        </div >
    );
}
