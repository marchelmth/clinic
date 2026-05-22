import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";

function getVerificationPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);

  if (parts[0] !== "verify-email" || !parts[1] || !parts[2]) {
    return null;
  }

  return `/api/email/verify/${parts[1]}/${parts[2]}${window.location.search}`;
}

export default function VerifyEmail() {
  const verificationPath = useMemo(() => getVerificationPath(), []);
  const [status, setStatus] = useState(verificationPath ? "loading" : "idle");
  const [message, setMessage] = useState(
    verificationPath ? "Memverifikasi email..." : "Masukkan email untuk mengirim ulang link verifikasi.",
  );

  useEffect(() => {
    if (!verificationPath) {
      return;
    }

    let isMounted = true;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${api.defaults.baseURL}${verificationPath}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        const responseBody = await response.text();
        const data = responseBody ? JSON.parse(responseBody) : {};

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error(data.message || `Verifikasi gagal dengan status ${response.status}`);
        }

        setStatus("success");
        setMessage(data.message || "Email berhasil diverifikasi. Silakan login.");
        showToast("success", "Sukses", "Email berhasil diverifikasi.");
      } catch (error) {
        if (!isMounted) return;
        setStatus("error");
        setMessage(error.message || "Link verifikasi tidak valid atau sudah kedaluwarsa.");
        showToast("error", "Error", error.message || "Verifikasi email gagal.");
      }
    };

    verifyEmail();
    return () => {
      isMounted = false;
    };
  }, [verificationPath]);

  const badgeClass = status === "success" ? "text-bg-success" : status === "error" ? "text-bg-danger" : "text-bg-secondary";

  return (
    <Layout title="Klinik Sehat | Verifikasi Email">
      <div className="container font-iosevka d-flex align-items-center py-5 min-vh-100">
        <div className="row justify-content-center w-100">
          <div className="col-11 col-sm-7 col-md-6 col-lg-5">
            <div className="card border-1 rounded-4 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                  <h5 className="text-uppercase mb-0">Verifikasi Email</h5>
                  <span className={`badge ${badgeClass}`}>{status === "loading" ? "Loading" : status === "success" ? "Sukses" : status === "error" ? "Gagal" : "Kirim Ulang"}</span>
                </div>

                <p className="text-muted mb-4">{message}</p>

                {!verificationPath && (
                  <h5 className="text-danger text-center" >Email anda gagal terverifikasi coba cek kembali email anda atau coba kirim ulang verifikasi email</h5>
                )}

                {verificationPath && (
                  <div>
                    <h5 className="text-muted text-center">
                      Anda bisa menutup halaman ini dan kembali ke halaman sebelumnya
                    </h5>
                  </div>

                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
