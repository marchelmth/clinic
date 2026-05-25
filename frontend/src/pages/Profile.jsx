import Layout from "../components/Layout.jsx";
import Header from "../components/Header.jsx";
import ProfileLayout from "../components/ProfileLayout.jsx";

export default function Profile() {
  return (
    <Layout title="Klinik Sehat | Profile">
      <Header page="Profile" className="sticky-top shadow-sm" />
      <main className="container py-5 font-iosevka">
        <ProfileLayout />
      </main>
    </Layout>
  );
}
