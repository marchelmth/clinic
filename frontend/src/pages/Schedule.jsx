import DoctorPanel from "../components/DoctorPanel.jsx";
import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";

export default function Schedule() {
  return (
    <Layout title="Klinik Sehat | Jadwal Dokter">
      <Header page="Jadwal Dokter" />
      <div className="container-fluid px-3 px-sm-4 px-lg-5 mt-4 font-iosevka">
        <div className="row">
          <div className="col-9 col-md-8 col-lg-7">
            <h1 className="hero-title display-6 mb-2 text-break">Jadwal Dokter</h1>
            <p className="hero-subtitle text-muted fs-6 mb-3">
              Lihat jadwal dokter di Klinik Sehat dan buat reservasi untuk kunjungan Anda.
            </p>
          </div>
        </div>
        <DoctorPanel />
      </div>
    </Layout>
  );
}
