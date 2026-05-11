import Counting from "../components/Counting.jsx";
import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";

export default function Home() {
  const title = "Klinik Sehat | Beranda";

  return (
    <Layout title={title}>
      <Header page="Beranda" />

      <div className="container-fluid px-3 px-sm-4 px-lg-5 mt-4 font-iosevka">
        <div className="row">
          <div className="col-9 col-md-8 col-lg-7">
            <h1 className="hero-title display-6 mb-2 text-break">Selamat Datang di Klinik Sehat</h1>
            <p className="hero-subtitle text-muted fs-6 mb-0">
              Sistem Penjadwalan Dokter dan Reservasi Antrean
            </p>
          </div>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-3 px-3 px-sm-4 px-lg-5 mt-1 mb-3 font-iosevka">
        <div className="col">
          <div className="card h-100 border-0 shadow-sm p-3 custom-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1">Total Dokter</p>
                <Counting />
              </div>
              <div className="bg-primary p-2 rounded-2 text-white">
                <i className="bi bi-person fs-4" />
              </div>
            </div>
          </div>
        </div>
        {[
          ["Antrean Hari Ini", "3", "bg-success", "bi-calendar"],
          ["Antrean Aktif", "3", "bg-warning", "bi-clock"],
          ["Pasien Bulan Ini", "3", "bg-secondary", "bi-graph-up-arrow"],
        ].map(([label, value, color, icon]) => (
          <div className="col" key={label}>
            <div className="card h-100 border-0 shadow-sm p-3 custom-card">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">{label}</p>
                  <p className="h2 fw-bold text-dark mb-0">{value}</p>
                </div>
                <div className={`${color} p-2 rounded-2 text-white`}>
                  <i className={`bi ${icon} fs-4`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 px-3 px-sm-4 px-lg-5 mt-5">
        <div className="col">
          <div className="card h-55 border-0 shadow-sm p-1 custom-card">
            <div className="card-body text-center font-iosevka">
              <h5 className="card-title">JADWAL PRAKTEK KLINIK</h5>
              <hr />
              {["Senin", "Selasa", "Rabu", "Kamis", "Sabtu"].map((day) => (
                <p className="card-text" key={day}>
                  <small className="text-muted">{day} - </small>
                  <strong>09:00-18:00</strong>
                </p>
              ))}
              <p className="card-text">
                <small className="text-muted">Jumat - </small>
                <strong>09:00-16:00</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-55 border-0 shadow-sm p-1 custom-card">
            <div className="card-body text-center font-iosevka">
              <h5 className="card-title">ANTREAN TERBARU</h5>
              <hr />
              {[1, 2, 3].map((number) => (
                <div className={`card border-0 shadow-sm p-1 custom-card ${number > 1 ? "mt-2" : ""}`} key={number}>
                  <div className="card-body d-flex text-center gap-3">
                    <p className="ms-5">#{String(number).padStart(3, "0")}</p>
                    <div className="ms-4">
                      <p className="mb-0 fw-bold">Minda Musuma</p>
                      <small className="text-muted">Jadwal: 09:00 - 09:30</small>
                    </div>
                  </div>
                </div>
              ))}
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
    </Layout>
  );
}
