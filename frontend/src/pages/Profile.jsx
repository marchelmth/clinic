import Layout from "../components/Layout.jsx";
import Header from "../components/Header.jsx";
import ProfileLayout from "../components/ProfileLayout.jsx";

export default function Profile() {
  const role = localStorage.getItem("role");

  const handleBackClick = () => {
    window.history.back();
  };
  return (
    <Layout title="Klinik Sehat | Profile">
      {role === "admin" ? (
        <button className="btn btn-sm text-white bg-secondary m-2" onClick={handleBackClick}>Kembali</button>
      ) : (
        <Header className="sticky-top shadow-sm" />
      )}
      <main className="container py-5 font-iosevka">
        <ProfileLayout />
      </main>
    </Layout>
  );
}
