import { useEffect, useState } from "react";
import Counting from "./HomeComp.jsx";
import Header from "./Header.jsx";
import Layout from "./Layout.jsx";
import api from "../services/api.js";
import { use } from "framer-motion/client";

export default function Home() {
  const title = "Klinik Sehat | Beranda";
  const [counts, setCounts] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState(null);

  useEffect(() => {
    let mounted = true;

    api.get("/api/stats")
      .then((res) => {
        if (mounted && res.data) {
          setStats(res.data.data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    api.get("/api/doctors")
      .then((res) => {
        if (mounted && res.data) {
          setCounts(res.data.data.length);
        }
      })
      .catch((err) => {
        console.error("Error fetching Doctor available:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    api.get("/api/new-queue")
      .then((res) => {
        if (mounted && res.data.data) {
          setQueue(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching new queues:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);


  return (
    <>
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-3 px-2 px-sm-4 px-lg-5 mt-3 font-iosevka">
        <div className="col">
          <div className="card h-100 border-0 shadow-sm p-3 custom-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1">Total Dokter Hari Ini</p>
                {counts !== null ? (
                  <p>{counts ?? 0}</p>
                ) : (
                  <span className="text-muted">Loading...</span>
                )}
              </div>
              <div className="bg-primary p-2 rounded-2 text-white">
                <i className="bi bi-person fs-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-100 border-0 shadow-sm p-3 custom-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1">Reservasi Hari Ini</p>
                {stats ? (
                  <p>{stats.today ?? 0}</p>
                ) : (
                  <span className="text-muted">Loading...</span>
                )}
              </div>
              <div className="bg-secondary p-2 rounded-2 text-white">
                <i className="bi bi-calendar fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-100 border-0 shadow-sm p-3 custom-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1">Antrean Aktif</p>
                {stats ? (
                  <p>{stats.active ?? 0}</p>
                ) : (
                  <span className="text-muted">Loading...</span>
                )}
              </div>
              <div className="bg-warning p-2 rounded-2 text-white">
                <i className="bi bi-clock fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-100 border-0 shadow-sm p-3 custom-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1">Pasien Bulan ini</p>
                {stats ? (
                  <p>{stats.monthly ?? 0}</p>
                ) : (
                  <span className="text-muted">Loading...</span>
                )}
              </div>
              <div className="bg-success p-2 rounded-2 text-white">
                <i className="bi bi-graph-up-arrow fs-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 px-3 px-sm-4 px-lg-5 mt-5"
      >
        <div className="col">
          <div className="card h-55 border-0 shadow-sm p-1 custom-card">
            <div className="card-body text-center font-iosevka">
              <h5 className="card-title">JADWAL PRAKTEK KLINIK</h5>
              <hr />
              <p className="card-text">
                <small className="text-muted">Senin - </small>
                <strong>08:00-18:00</strong>
              </p>
              <p className="card-text">
                <small className="text-muted">Selasa - </small>
                <strong>08:00-18:00</strong>
              </p>
              <p className="card-text">
                <small className="text-muted">Rabu - </small>
                <strong>08:00-18:00</strong>
              </p>
              <p className="card-text">
                <small className="text-muted">Kamis - </small>
                <strong>08:00-18:00</strong>
              </p>
              <p className="card-text">
                <small className="text-muted">Jumat - </small>
                <strong>08:00-16:00</strong>
              </p>
              <p className="card-text">
                <small className="text-muted">Sabtu - </small>
                <strong>08:00-18:00</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-55 border-0 shadow-sm p-1 custom-card">
            <div className="card-body text-center font-iosevka">
              <h5 className="card-title">ANTREAN TERBARU</h5>
              <hr />
              {queue?.length > 0 ? (
                queue?.map((queues, index) => (
                  <div className={`card border-0 shadow-sm p-1 custom-card ${index > 0 ? "mt-2" : ""}`} key={queues.id}>
                    <div className="card-body d-flex text-center gap-3">
                      <p className="ms-5">#{String(queues.queue_code).padStart(3, "0")}</p>
                      <div className="ms-5">
                        <p className="mb-0 fw-bold">{queues.user.name}</p>
                        <small className="text-muted">Poli: {queues.schedule.doctor.specialization}</small>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="card-text p-5 fs-5">Belum ada antrean hari ini</p>
              )}
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-55 border-0 shadow-sm p-1 custom-card">
            <div className="card-body text-center font-iosevka">
              <h5 className="card-title">PENGUMUMAN</h5>
              <hr />
              <p className="card-text">- Klinik Sehat akan tutup pada tanggal 25 Desember 2023 untuk perayaan Natal.</p>
              <p className="card-text">- Pastikan untuk melakukan reservasi sebelum datang ke klinik.</p>
              <p className="card-text">- Pastikan memilih spesialisasi dokter yang sesuai dengan keluhan Anda.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
