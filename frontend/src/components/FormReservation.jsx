import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";

function formatTime(value) {
  return value?.replace(/:00$/, "") || "";
}

export default function FormReservation() {
  const [reservations, setReservations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch (e) {
      return null;
    }
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    api.get("/api/doctors")
      .then((resDoctors) => {
        if (!mounted) return;

        const rawReservations = resDoctors.data?.data || [];

        setReservations(
          rawReservations.map((reservation) => ({
            id: reservation.id,
            specialization: reservation.specialization,
            schedules: (reservation.schedules || []).map((schedule) => ({
              id: schedule.id,
              date: schedule.date,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
            })),
          })),
        );
      })
      .catch((error) => {
        console.error("Gagal mengambil data form reservasi:", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedDoctor = useMemo(
    () => reservations.find((reservation) => reservation.id === Number(selectedDoctorId)),
    [reservations, selectedDoctorId],
  );

  const handleDoctorChange = (event) => {
    setSelectedDoctorId(event.target.value);
    setSelectedScheduleId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedScheduleId) {
      showToast("error", "Error", "Pilih jadwal terlebih dahulu.");
      return;
    }

    if (!complaint.trim()) {
      showToast("error", "Error", "Isi keluhan terlebih dahulu.");
      return;
    }

    const token = localStorage.getItem("auth_token");
    const storedUser = JSON.parse(localStorage.getItem("auth_user") || "null");

    if (!token) {
      showToast("warning", "Login diperlukan", "Silakan login terlebih dahulu.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 900);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: storedUser?.id || selectedUser?.id,
          schedule_id: selectedScheduleId,
          keluhan: complaint.trim(),
        }),
      });

      const responseBody = await response.text();
      const data = responseBody ? JSON.parse(responseBody) : {};

      if (!response.ok) {
        throw new Error(data.message || `Request gagal dengan status ${response.status}`);
      }

      showToast("success", "Berhasil", "Reservasi berhasil dibuat!");
      setSelectedDoctorId("");
      setSelectedScheduleId("");
      setComplaint("");

      setTimeout(() => {
        window.location.href = "/queue";
      }, 900);
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", error.message || "Terjadi kesalahan saat membuat reservasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted text-center mb-0">Memuat form reservasi...</p>;
  }

  return (
    <form id="reservationForm" noValidate onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label fw-medium" htmlFor="peserta">
          Peserta
        </label>
        <input
          disabled
          id="peserta"
          className="form-control bg-body-secondary"
          value={selectedUser?.name || ""}
          placeholder="Data peserta tidak tersedia"
          readOnly
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium" htmlFor="poli">
          Poli
        </label>
        <select
          name="poli"
          id="poli"
          className="form-select bg-body-secondary"
          value={selectedDoctorId}
          onChange={handleDoctorChange}
        >
          <option value="">Pilih Poli</option>
          {reservations.map((reservation) => (
            <option key={reservation.id} value={reservation.id}>
              {reservation.specialization}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium" htmlFor="hari">
          Hari
        </label>
        <select
          name="hari"
          id="hari"
          className="form-select bg-body-secondary"
          value={selectedScheduleId}
          onChange={(event) => setSelectedScheduleId(event.target.value)}
          disabled={!selectedDoctorId}
        >
          <option value="">{selectedDoctorId ? "Pilih Hari" : "Pilih Poli terlebih dahulu"}</option>
          {(selectedDoctor?.schedules || []).map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.date} ({formatTime(schedule.start_time)} - {formatTime(schedule.end_time)})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label fw-medium" htmlFor="keluhan">
          Keluhan
        </label>
        <textarea
          id="keluhan"
          rows="3"
          placeholder="Silakan isi keluhan..."
          className="form-control bg-body-secondary"
          value={complaint}
          onChange={(event) => setComplaint(event.target.value)}
        />
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-success btn-md text-white" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
