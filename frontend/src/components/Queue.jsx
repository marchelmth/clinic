import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import trimValue from "../../helper/Trimming.js";


export default function Queue() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [queue, setQueue] = useState([]);
    const token = localStorage.getItem("auth_token");

    useEffect(() => {
        setIsMounted(true);

        console.log("Status Token saat useEffect berjalan:", token);

        api.get("/api/admin/stats")
            .then((res) => {
                if (res.data) {
                    setStats(res.data);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                console.error("Error di statistik admin:", err);
                setIsLoading(false);
            });

        if (token) {
            console.log("Token lolos pengecekan, mengirim request queue...");
            api.get("/api/queues", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => {
                    if (response.data) {
                        setQueue(response.data.data);
                        setIsLoading(false);
                    }
                    console.log("Fetched queue :", response.data.data);
                })
                .catch((err) => {
                    console.error("Error di request queue:", err);
                    setIsLoading(false);
                });

            return () => {
                setIsMounted(false);
            };
        } else {
            console.log("Request queue dilewati karena token tidak ada.");
        }
    }, [token]);

    if (queue.length === 0) {
        return (
            <div className="container py-5 font-iosevka vh-100 d-flex flex-column justify-content-center align-items-center">
                <h2 className="text-center">Anda tidak memiliki antrean aktif hari ini</h2>
                <p className="text-center text-muted">Silakan buat reservasi untuk mendapatkan nomor antrean.</p>
            </div>
        );
    }

    return (
        <main className="container my-2 font-iosevka bg-body-secondary">
            <div className="card p-4 mb-4 shadow bg-primary text-white">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <p className="mb-1 opacity-75">Nomor Antrean Anda</p>
                        <h1 className="display-3 fw-bold mb-4">{queue?.queue_code || 'N/A'}</h1>
                        <div className="row">
                            <div className="col-4">
                                <small className="d-block opacity-75 text-white">Dokter</small>
                                <span className="fw-bold">{queue?.schedule?.doctor?.name || 'N/A'}</span>
                            </div>
                            <div className="col-4 border-start border-light border-opacity-25">
                                <small className="d-block opacity-75 text-white">Posisi Antrean</small>
                                {stats ? (
                                    <span className="fw-bold">{stats.data.position ?? 0}/{stats.data.today ?? 0}</span>
                                ) : (
                                    <span className="fw-bold">Loading...</span>
                                )}
                            </div>
                            <div className="col-4 border-start border-light border-opacity-25">
                                <small className="d-block opacity-75 text-white">Estimasi Waktu</small>
                                {stats ? (
                                    <span className="fw-bold">{trimValue(stats.data.averageTime) ?? '15'} menit</span>
                                ) : (
                                    <span className="fw-bold">Loading...</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card p-4 mb-4 shadow-sm">
                        <h5 className="fw-bold mb-4">Antrean Saat Ini</h5>
                        <div className="row g-3 mb-5">
                            {[
                                ["Poli Umum", "A-015", "8"],
                                ["Poli Anak", "B-007", "5"],
                            ].map(([name, currentNumber, waiting]) => (
                                <div className="col-md-6" key={name}>
                                    <div className="p-3 border rounded-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fw-bold">{name}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-end">
                                            <div>
                                                <small className="text-muted d-block small">Nomor Sekarang</small>
                                                <h2 className="fw-bold mb-0">{currentNumber}</h2>
                                            </div>
                                            <div className="text-end">
                                                <small className="text-muted d-block small">Menunggu</small>
                                                <h4 className="fw-bold mb-0 text-secondary">{waiting}</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h5 className="fw-bold mb-3 mt-2">Panggilan Terakhir</h5>
                        <div className="list-panggilan d-flex justify-content-between align-items-center border-start border-primary border-4 shadow-sm p-3 mb-2 rounded bg-light">
                            <div>
                                <span className="badge bg-primary text-white me-3 px-3 py-2">A-013</span> Poli Umum
                            </div>
                            <small className="text-muted">
                                <i className="bi bi-clock me-1" /> 2 menit lalu
                            </small>
                        </div>
                        <div className="list-panggilan d-flex justify-content-between align-items-center p-3 mb-2 rounded bg-light">
                            <div>
                                <span className="badge bg-secondary text-white me-3 px-3 py-2">B-006</span> Poli Anak
                            </div>
                            <small className="text-muted">
                                <i className="bi bi-clock me-1" /> 5 menit lalu
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card p-4 mb-4 queue-info">
                        <div className="d-flex mb-3">
                            <i className="bi bi-info-circle-fill text-primary me-2" />
                            <h6 className="fw-bold mb-0">Informasi Penting:</h6>
                        </div>
                        <ul className="small text-secondary ps-3 mb-0">
                            <li className="mb-2">Harap datang 10 menit sebelum waktu reservasi</li>
                            <li className="mb-2">Bawa kartu identitas dan kartu berobat</li>
                            <li className="mb-2">Jika terlambat lebih dari 15 menit, antrean hangus</li>
                            <li>Hubungi petugas jika ada kendala</li>
                        </ul>
                    </div>

                    <div className="card p-4 shadow-sm">
                        <h5 className="fw-bold mb-3">Statistik Hari Ini</h5>
                        <div className="d-flex justify-content-between mb-2">
                            {stats ? (
                                <>
                                    <span>Total Pasien</span>
                                    <span className="fw-bold">{stats.data.today ?? 0}</span>
                                </>
                            ) : (
                                <span>Loading...</span>
                            )}
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            {stats ? (
                                <>
                                    <span>Selesai Dilayani</span>
                                    <span className="fw-bold text-success">{stats.data.completed ?? 0}</span>
                                </>
                            ) : (
                                <span>Loading...</span>
                            )}
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            {stats ? (
                                <>
                                    <span>Sedang Menunggu</span>
                                    <span className="fw-bold text-danger">{stats.data.waiting ?? 0}</span>
                                </>
                            ) : (
                                <span>Loading...</span>
                            )}
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="small">Rata-rata Waktu</span>
                            <span className="fw-bold text-primary">{trimValue(stats?.data?.averageTime) ?? '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}