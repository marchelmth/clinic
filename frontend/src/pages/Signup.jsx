import Layout from "../components/Layout.jsx";
import FormSignup from "../components/FormSignup.jsx";

export default function Signup() {
  return (
    <Layout title="Klinik Sehat | Daftar Akun">
      <div className="container font-iosevka min-vh-100 d-flex flex-column justify-content-center">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-lg-6 col-xl-5">
            <div className="card border-1 rounded-4 shadow-sm">
              <div className="card-body p-4">
                <h5 className="text-uppercase text-center mb-1">Create an account</h5>
                <small className="d-block text-center text-muted mt-1 mb-3">
                  Sebelum membuat reservasi, silakan buat akun terlebih dahulu.
                  Sudah punya akun? {" "}
                  <a href="/login" className="fw-bold text-body">
                    <u className="text-decoration-none">Login</u>
                  </a>
                </small>
                <FormSignup />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
