import Layout from "../components/Layout.jsx";

export default function Profile() {
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("profile_name");
    window.location.href = "/";
  };

  return (
    <Layout title="Klinik Sehat | Profile">
      <main className="container py-4 font-iosevka">
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </main>
    </Layout>
  );
}
