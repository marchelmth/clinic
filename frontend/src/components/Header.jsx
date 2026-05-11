import { useEffect, useState } from "react";
import Link from "./Link.jsx";
import ProfilePicture from "./ProfilePicture.jsx";

export default function Header({ page = "", className = "" }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("auth_token")));
  }, []);

  const protectedClass = isLoggedIn ? "" : " disabled text-muted";
  const protectedProps = isLoggedIn
    ? {}
    : { tabIndex: -1, style: { pointerEvents: "none" } };

  return (
    <header className={className}>
      <nav className="navbar navbar-expand-lg bg-white">
        <div className="container-fluid text-center font-iosevka">
          <a className="navbar-brand mx-0 mx-lg-5 text-dark" href="/">
            <strong>Klinik Sehat</strong>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse align-items-center" id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto gap-3 mb-2 mb-lg-0 gx-5">
              <li className="nav-item">
                <Link href="/" className={`nav-link text-dark ${page === "Beranda" ? "active fw-bold" : ""}`}>
                  Beranda
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/schedule"
                  className={`nav-link text-dark ${page === "Jadwal Dokter" ? "active fw-bold" : ""}`}
                >
                  Jadwal Dokter
                </Link>
              </li>
              <li className="nav-item">
                <a
                  href="/reservation"
                  className={`nav-link text-dark${protectedClass} ${
                    page === "Reservasi" ? "active fw-bold" : ""
                  }`}
                  {...protectedProps}
                >
                  Reservasi
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="/queue"
                  className={`nav-link text-dark${protectedClass} ${page === "queue" ? "active fw-bold" : ""}`}
                  {...protectedProps}
                >
                  Antrean
                </a>
              </li>
            </ul>
            <ProfilePicture className="d-none d-lg-block mx-4" />
          </div>
        </div>
      </nav>
    </header>
  );
}
