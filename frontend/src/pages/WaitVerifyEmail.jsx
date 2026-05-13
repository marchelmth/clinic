import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";
import api from "../services/api.js";

export default function WaitVerifyEmail() {
    const pendingEmail = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get("email") || localStorage.getItem("pending_verification_email") || "";
    }, []);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [message, setMessage] = useState(
        pendingEmail
            ? `Kami telah mengirimkan email verifikasi ke ${pendingEmail}.`
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

        return () => window.clearInterval(intervalId);

        if (isConfirmed) {
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        }
    }, [pendingEmail]);

    return (
        <Layout title="Klinik Sehat | Verifikasi Email (Waiting for Verification)">
            <Header page="Verify Email (Waiting for Verification)" className="sticky-top" />
            <div className="container font-iosevka d-flex align-items-center py-5 min-vh-100">
                <div className="row justify-content-center w-100">
                    <div className="col-11 col-sm-8 col-md-6 col-lg-5">
                        <div className="card border-1 rounded-4 shadow-sm">
                            <div>
                                <div className="card-body p-4 text-center">
                                    <h3 className="mb-3">Tunggu Verifikasi Email</h3>
                                    <p className="text-muted mb-4">{message}</p>
                                    <p className="text-muted mb-4">Jika Anda belum menerima email verifikasi, silakan periksa folder spam atau junk mail Anda.</p>
                                    <p className="text-muted mb-4">Setelah memverifikasi email, silakan kembali ke halaman login untuk masuk ke akun Anda.</p>
                                    {!pendingEmail && (
                                        <a href="/verify-email" className="btn btn-primary text-white">
                                            Kirim Ulang Verifikasi
                                        </a>
                                    )}
                                    {isConfirmed && (
                                        <div>
                                            <p className="text-success">Email Anda telah diverifikasi!</p>
                                            <p className="text-white">Anda akan diarahkan ke halaman login!</p>
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
