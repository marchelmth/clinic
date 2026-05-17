import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
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
  const [statusVerify, setStatusVerify] = useState(verificationPath ? "loading" : "idle");
  const [message, setMessage] = useState(
    verificationPath ? "Memverifikasi email..." : "Masukkan email untuk mengirim ulang link verifikasi.",
  );
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!verificationPath) {
      return;
    }

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

        if (!response.ok) {
          throw new Error(data.message || `Verifikasi gagal dengan status ${response.status}`);
        }

        setStatus("success");
        setMessage(data.message || "Email berhasil diverifikasi. Silakan login.");
        showToast("success", "Sukses", "Email berhasil diverifikasi.");
        console.log("Email berhasil diverifikasi:", data);
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Link verifikasi tidak valid atau sudah kedaluwarsa.");
        showToast("error", "Error", error.message || "Verifikasi email gagal.");
      }
    };

    verifyEmail();
  }, [verificationPath]);

  const handleResend = async (event) => {
    event.preventDefault();

    if (!email) {
      showToast("error", "Error", "Masukkan email.");
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/email/verification-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const responseBody = await response.text();
      const data = responseBody ? JSON.parse(responseBody) : {};

      if (!response.ok) {
        throw new Error(data.message || `Request gagal dengan status ${response.status}`);
      }

      if (data.message === "Email already verified") {
        setStatusVerify("success");
        setMessage("Email sudah diverifikasi. Silakan login.");
        showToast("success", "Sukses", "Email sudah diverifikasi. Silakan login.");
        return;
      }

      if (response.status === 422) {
        setStatus("error");
        setMessage("Email tidak valid.");
        showToast("error", "Error", "Email tidak valid.");
        return;
      }

      setStatusVerify("success");
      setMessage(data.message || "Link verifikasi sudah dikirim ulang. Cek inbox email Anda.");
      showToast("success", "Sukses", "Link verifikasi sudah dikirim ulang.");

      setTimeout(() => {
        window.location.href = "/wait-verify-email?email=" + encodeURIComponent(email);
      }, 10);

    } catch (error) {
      setStatus("error");
      console.log(error)
      setMessage(error.message || "Gagal mengirim ulang link verifikasi.");
      showToast("error", "Error", error.message || "Gagal mengirim ulang link verifikasi.");
    } finally {
      setIsResending(false);
    }
  };

  const badgeClass = status === "success" ? "text-bg-success" : status === "error" ? "text-bg-danger" : "text-bg-secondary";

  return (
    <Layout title="Klinik Sehat | Verifikasi Email">
      <Header page="Verify Email" className="sticky-top" />
      <div className="container font-iosevka d-flex align-items-center py-5 min-vh-100">
        <div className="row justify-content-center w-100">
          <div className="col-11 col-sm-7 col-md-6 col-lg-5">
            <div className="card border-1 rounded-4 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                  <h5 className="text-uppercase mb-0">Verifikasi Email</h5>
                  <span className={`badge ${badgeClass}`}>{statusVerify === "loading" ? "Loading" : statusVerify === "success" ? "Sukses" : statusVerify === "error" ? "Gagal" : "Kirim Ulang"}</span>
                </div>

                <p className="text-muted mb-4">{message}</p>

                {!verificationPath && (
                  <form onSubmit={handleResend}>
                    <label className="form-label fw-medium" htmlFor="verify-email">
                      Email
                    </label>
                    <input
                      id="verify-email"
                      type="email"
                      className="form-control bg-body-secondary mb-3"
                      placeholder="Masukkan email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary w-100" disabled={isResending}>
                      {isResending ? "Mengirim..." : "Kirim Link Verifikasi"}
                    </button>
                  </form>
                )}

                {verificationPath && (
                  <button className="btn btn-primary w-100" onClick={() => window.location.href = "/login"}>
                    Kembali ke Halaman Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
