import { useEffect, useState } from "react";
import api from "../services/api.js";

function formatTime(value) {
  return value?.replace(/:00$/, "") || "";
}

export default function DoctorPanel() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;

    if (token) {
      setIsLoggedIn(true);
    }

    api
      .get("/api/doctors")
      .then(({ data }) => {
        if (mounted) setDoctors(data.data || []);
      })
      .catch(() => {
        if (mounted) setDoctors([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-muted text-center">Memuat data dokter...</p>;
  }

  if (!Array.isArray(doctors) || doctors.length === 0) {
    return <p className="text-muted text-center">Belum ada data dokter tersedia.</p>;
  }

  return (
    <div className="row g-3 me-0">
      {doctors.map((doctor) => {
        const schedule = doctor.schedules?.[0];

        return (
          <div className="col-md-6" key={doctor.id}>
            <div className="card p-4 h-100 shadow-sm">
              <div className="mb-0">
                <h4 className="fw-bold mb-1">Dr. {doctor.name}</h4>
                <p className="text-primary mb-0">{doctor.specialization === "UMUM" ? "Dokter" : "Spesialis"} {doctor.specialization}</p>
              </div>

              <hr className="text-light-emphasis" />

              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-calendar3 me-3 text-secondary" />
                  <div>
                    <span className="d-block fw-bold">{schedule?.date || "Jadwal Belum Tersedia"}</span>
                    <small className="text-muted">
                      {schedule
                        ? `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`
                        : "Jam Belum Tersedia"}
                    </small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-geo-alt me-3 text-secondary" />
                  <span>{doctor.room ? `Ruang : ${doctor.room}` : "Ruang Belum Tersedia"}</span>
                </div>
              </div>

              {isLoggedIn ? (
                <a href="/login" className="text-white text-decoration-none">
                  <button className="btn btn-primary w-100 mt-auto fw-bold">Login untuk Buat Janji Temu</button>
                </a>
              ) : (
                <a href="/reservation" className="text-white text-decoration-none">
                  <button className="btn btn-primary w-100 mt-auto fw-bold">Buat Janji Temu</button>
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
