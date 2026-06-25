import { useState } from "react";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";

export default function FormSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowResetPassword = () => {
    setShowResetPassword(!showResetPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name) {
      showToast("error", "Error", "Masukkan nama lengkap.");
      return;
    }

    if (!email) {
      showToast("error", "Error", "Masukkan email.");
      return;
    }

    if (!password) {
      showToast("error", "Error", "Masukkan password.");
      return;
    }

    if (password !== repeatPassword) {
      showToast("error", "Error", "Password dan repeat password tidak cocok.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseBody = await response.text();
      const data = responseBody ? JSON.parse(responseBody) : {};

      if (!response.ok) {
        if (typeof data === "object" && data !== null) {
          let errorMessage = "";
          if (typeof data.message === "object" && data.message !== null) {
            errorMessage = Object.values(data.message).flat().join(" ");
          } else {
            errorMessage = data.message;
          }
          throw new Error(errorMessage);
        }
        throw new Error(data.message || `Request gagal dengan status ${response.status}`);
      }
      localStorage.setItem("pending_verification_email", email);
      setName("");
      setEmail("");
      setPassword("");
      setRepeatPassword("");
      showToast("success", "Sukses", data.message);
      setTimeout(() => {
        window.location.href = "/wait-verify-email";
      }, 900);
    } catch (error) {
      showToast("error", "Error", error.message || "Terjadi kesalahan saat membuat akun.");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-outline mt-2 mb-3">
          <label className="form-label" htmlFor="name">
            Nama Lengkap
          </label>
          <input
            required
            type="text"
            id="name"
            placeholder="John Doe"
            className="form-control form-control-sm bg-body-secondary"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-outline mb-3">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            required
            type="email"
            id="email"
            placeholder="name@example.com"
            className="form-control form-control-sm bg-body-secondary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <small className="text-muted">
            Harap menggunakan email yang Aktif
          </small>
        </div>
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <div className="form-outline mb-3 input-group">
          <input
            required
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="******"
            className="form-control form-control-sm bg-body-secondary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="input-group-text" onClick={toggleShowPassword} style={{ cursor: "pointer" }}>
            <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} onClick={toggleShowPassword} style={{ cursor: "pointer" }}></i>
          </span>
        </div>
        <label className="form-label" htmlFor="repeatPassword">
          Ulangi password Anda
        </label>
        <div className="form-outline mb-3 input-group">
          <input
            required
            type={showResetPassword ? "text" : "password"}
            id="repeatPassword"
            placeholder="******"
            className="form-control form-control-sm bg-body-secondary"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
          <span className="input-group-text" onClick={toggleShowResetPassword} style={{ cursor: "pointer" }}>
            <i className={showResetPassword ? "bi bi-eye-slash" : "bi bi-eye"} onClick={toggleShowResetPassword} style={{ cursor: "pointer" }}></i>
          </span>
        </div>
        <div className="form-check d-flex justify-content-center mb-2">
          <input className="form-check-input me-2 bg-dark" type="checkbox" id="checkBox" required />
          <label className="form-check-label" htmlFor="checkBox">
            <small> Saya setuju dengan semua pernyataan dalam{" "} </small>
            <a href="#!" className="text-body">
              <u>Terms of service</u>
            </a>
          </label>
        </div>
        <div className="d-flex justify-content-center">
          <button type="submit" className="btn btn-success btn-block btn-md text-white">
            Register
          </button>
        </div>
      </form >
    </>
  );
}
