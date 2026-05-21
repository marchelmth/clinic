import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";
import api from "../services/api.js";

export default function WaitVerifyEmail() {
    const pendingEmail = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get("email") || localStorage.getItem("pending_verification_email") || "";
    }, []);
    const [currentEmail, setCurrentEmail] = useState(pendingEmail);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(
        currentEmail
            ? `Kami telah mengirimkan email verifikasi ke ${currentEmail}.`
            : "Email verifikasi belum ditemukan. Silakan kembali daftar atau kirim ulang verifikasi.",
    );
    useEffect(() => {
        if (!pendingEmail) {
            return;
        }

        const checkEmailVerification = async () => {
            try {
                const params = new URLSearchParams({ email: pendingEmail });
                const response = await fetch(`${api.defaults.baseURL}/api/email/verify-status?${params.toString()}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                });

                const responseBody = await response.text();
                const data = responseBody ? JSON.parse(responseBody) : {};

                if (!response.ok) {
                    throw new Error(data.message || `Gagal memeriksa status verifikasi dengan status ${response.status}`);
                }

                const verified = Boolean(data.data?.verified);
                setIsConfirmed(verified);

                if (verified) {
                    localStorage.removeItem("pending_verification_email");
                    setMessage("Email Anda telah diverifikasi. Silakan login.");
                }
            } catch (error) {
                console.error("Error memeriksa status verifikasi email:", error);
            }
        }

        checkEmailVerification();
        const intervalId = window.setInterval(checkEmailVerification, 5000);

        if (isConfirmed) {
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        }
        return () => window.clearInterval(intervalId);
    }, [currentEmail, isConfirmed]);

    const handleChangeEmail = async (e) => {
        e.preventDefault();
        if (!newEmail || newEmail === currentEmail) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${api.defaults.baseURL}/api/update-email`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    old_email: currentEmail,
                    new_email: newEmail
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengubah email");
            }

            localStorage.setItem("pending_verification_email", newEmail);
            setCurrentEmail(newEmail);
            setMessage(`Email berhasil diperbarui! Kami telah mengirimkan email verifikasi baru ke ${newEmail}.`);
            setIsEditing(false);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout title="Klinik Sehat | Verifikasi Email (Waiting for Verification)">
            <Header page="Verify Email (Waiting for Verification)" className="sticky-top" />
            <div className="container font-iosevka d-flex align-items-center min-vh-100">
                <div className="row justify-content-center w-75 mx-auto">
                    <div className="col-11 col-sm-8 col-md-6 col-lg-5">
                        <div className="card border-2 rounded-4 shadow-sm">
                            <div>
                                <div className="card-body p-4 text-center">
                                    {!isConfirmed && !isEditing && (
                                        <>
                                            <h3 className="mb-3">Tunggu Verifikasi Email</h3>
                                            <p className="text-muted mb-4">{message}</p>
                                            <hr className="border border-dark" />
                                            <p className="text-dark">Salah mengisi email?</p>
                                            <button
                                                onClick={() => { setIsEditing(true); setNewEmail(currentEmail); }}
                                                className="btn btn-success w-100 text-white mb-2 border border-dark rounded-4"
                                            >
                                                Ubah Alamat Email
                                            </button>
                                            <a href="/signup" className="btn btn-outline-secondary w-100 border border-dark rounded-4 text-dark">Kembali Daftar Baru</a>
                                        </>
                                    )}
                                    {!isConfirmed && isEditing && (
                                        <form onSubmit={handleChangeEmail}>
                                            <div className="mb-3 text-start">
                                                <label className="form-label text-dark">Masukkan Email yang Benar:</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={newEmail}
                                                    onChange={(e) => setNewEmail(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-success w-100 mb-2" disabled={isLoading}>
                                                {isLoading ? "Menyimpan..." : "Simpan & Kirim Ulang"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="btn btn-light w-100"
                                                disabled={isLoading}
                                            >
                                                Batal
                                            </button>
                                        </form>
                                    )}

                                    {isConfirmed && (
                                        <div>
                                            <h4 className="text-success font-weight-bold">Email Anda telah diverifikasi!</h4>
                                            <h6 className="text-muted">Anda akan diarahkan ke halaman login...</h6>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
