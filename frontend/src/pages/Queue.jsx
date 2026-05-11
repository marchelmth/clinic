import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";

export default function Queue() {
  return (
    <Layout title="Klinik Sehat | Antrean">
      <Header page="queue" />
      <main className="container my-2 font-iosevka bg-body-secondary">
        <div className="card p-4 mb-4 shadow bg-primary text-white">
          <div className="row align-items-center">
            <div className="col-md-8">
              <p className="mb-1 opacity-75">Nomor Antrean Anda</p>
              <h1 className="display-3 fw-bold mb-4">A-042</h1>
              <div className="row">
                <div className="col-4">
                  <small className="d-block opacity-75 text-white">Dokter</small>
                  <span className="fw-bold">Dr. Ahmad Wijaya, Sp.PD</span>
                </div>
                <div className="col-4 border-start border-light border-opacity-25">
                  <small className="d-block opacity-75 text-white">Posisi Antrean</small>
                  <span className="fw-bold">3/3 </span>
                </div>
                <div className="col-4 border-start border-light border-opacity-25">
                  <small className="d-block opacity-75 text-white">Estimasi Waktu</small>
                  <span className="fw-bold">15 menit</span>
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
                <span>Total Pasien</span>
                <span className="fw-bold">48</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Selesai Dilayani</span>
                <span className="fw-bold text-success">36</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Sedang Menunggu</span>
                <span className="fw-bold text-danger">12</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span className="small">Rata-rata Waktu</span>
                <span className="fw-bold text-primary">12 menit</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
