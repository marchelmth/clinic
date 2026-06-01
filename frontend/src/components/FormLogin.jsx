import { useState } from "react";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";
import { a } from "framer-motion/client";

export default function FormLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verifyEmailLink, setVerifyEmailLink] = useState("");
  const token = localStorage.getItem("auth_token");

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      showToast("error", "Error", "Masukkan email.");
      return;
    }

    if (!password) {
      showToast("error", "Error", "Masukkan password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseBody = await response.text();
      let data = {};

      try {
        data = responseBody ? JSON.parse(responseBody) : {};
      } catch (error) {
        data = { message: responseBody || "Response tidak valid" };
      }

      if (!response.ok) {
        if (response.status === 403) {
          showToast(
            "error",
            "Error",
            <span>
              Email Belum diverifikasi.{" "}
              <a href="/verify-email" style={{ color: "#fff", textDecoration: "underline" }}>
                Kirim ulang email verifikasi.
              </a>
            </span>
          );
          return;
        }

        let rawMessage = data.message || `Request gagal dengan status ${response.status}`;
        const removeQuotes = (str) => str.replace(/^"(.*)"$/, "$1");
        const finalMessage = typeof rawMessage === "object" ? removeQuotes(JSON.stringify(rawMessage.email[0])) : rawMessage;

        console.error("Login error:", finalMessage);

        throw new Error(finalMessage);
      }

      const token = data.data?.token;

      if (!token) {
        throw new Error("Akun belum terdaftar silakan daftar terlebih dahulu.");
      }

      localStorage.setItem("auth_token", token);

      setEmail("Please Wait...");
      setPassword("");
      showToast("success", "Successfully", "Login berhasil!");

      setTimeout(() => {
        window.location.href = "/";
      }, 1100);
    } catch (error) {
      showToast("error", "Error", error.message || "Terjadi kesalahan saat login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {!token ? (
        <>
          <form id="loginForm" noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control bg-body-secondary"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <label className="form-label fw-medium" htmlFor="password">
              Password
            </label>
            <div className="mb-4 input-group">
              <input
                id="password"
                placeholder="******"
                className="form-control bg-body-secondary"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <span
                className="input-group-text"
                onClick={toggleShowPassword}
                style={{ cursor: "pointer" }}
              >
                <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </span>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : "Login"}
              </button>
            </div>
          </form>

          <p className="text-center mt-3">
            Belum punya akun? <a href="/signup">Daftar di sini</a>
          </p>
        </>
      ) : (
        <p className="text-center mt-3">
          Sudah login. <a href="/">Kembali ke beranda</a>
        </p>

      )}
    </>
  );
}
