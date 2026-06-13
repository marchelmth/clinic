import Layout from '../components/Layout'
import Header from '../components/Header'
import HomeComp from '../components/HomeComp'

export default function Home() {
  return (
    <Layout title="Klinik Sehat | Beranda">
      <Header page="Beranda" />

      <div className="container-fluid px-3 px-sm-4 px-lg-5 mt-4 font-iosevka">
        <div className="row">
          <div className="col-9 col-md-8 col-lg-7">
            <h1 className="hero-title display-6 mb-2 text-break">
              Selamat Datang di Klinik Sehat</h1>
            <p className="hero-subtitle text-muted fs-6 mb-0">
              Sistem Penjadwalan Dokter dan Reservasi Antrean
            </p>
          </div>
        </div>
      </div>
      <HomeComp />
    </Layout>
  )
}