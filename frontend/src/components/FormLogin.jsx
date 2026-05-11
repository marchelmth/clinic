import { useState } from "react";
import api from "../services/api.js";
import { showToast } from "../utils/toast.js";
import { s } from "framer-motion/client";

function getProfileName(user) {
  const nameParts = (user?.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  return {
    firstName,
    lastName,
    profileName: [firstName, lastName].filter(Boolean).join(" "),
  };
}

export default function FormLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const data = responseBody ? JSON.parse(responseBody) : {};

      if (!response.ok) {
        throw new Error(data.message || `Request gagal dengan status ${response.status}`);
      }

      const token = data.data?.token;
      const user = data.data?.user;

      if (!token) {
        throw new Error("Token login tidak ditemukan dari server.");
      }

      const { firstName, lastName, profileName } = getProfileName(user);

      localStorage.setItem("auth_token", token);
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          ...(user || {}),
          first_name: firstName,
          last_name: lastName,
          profile_name: profileName,
        }),
      );
      localStorage.setItem("profile_name", profileName);

      setEmail("Please Wait...");
      setPassword("");
      showToast("success", "Successfully", "Login berhasil!");

      setTimeout(() => {
        window.location.href = "/";
      }, 900);
    } catch (error) {
      console.error(error);
      showToast("error", "Error", error.message || "Terjadi kesalahan saat login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            placeholder="Masukkan email"
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
            placeholder="Silakan isi password..."
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
  );
}
