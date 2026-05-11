import FormLogin from "../components/FormLogin.jsx";
import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";

export default function Login() {
  return (
    <Layout title="Klinik Sehat | Login">
      <Header page="Login" className="sticky-top" />
      <div className="container font-iosevka d-flex align-items-center py-5 min-vh-100">
        <div className="row justify-content-center w-100 mb-3 mb-md-5">
          <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4 ms-11">
            <div className="card border-1 rounded-4 shadow-sm">
              <div className="card-body p-2 p-md-3">
                <h5 className="text-uppercase text-center mb-3">Login</h5>
                <FormLogin />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
