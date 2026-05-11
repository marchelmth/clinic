import FormReservation from "../components/FormReservation.jsx";
import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";

export default function Reservation() {
  return (
    <Layout title="Klinik Sehat | Reservasi">
      <Header page="Reservasi" className="sticky-top" />
      <div className="container font-iosevka min-vh-100 d-flex align-items-center py-4">
        <div className="row justify-content-center w-100 mb-3 mb-md-5">
          <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4 ms-3">
            <div className="card border-1 rounded-4 shadow-sm">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-uppercase text-center mb-3">Buat Reservasi</h5>
                <FormReservation />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
