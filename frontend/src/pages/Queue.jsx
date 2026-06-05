import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";
import Queue from "../components/Queue.jsx";

export default function QueuePage() {
  return (
    <Layout title="Klinik Sehat | Antrean">
      <Header page="queue" />

      <Queue />
    </Layout>
  );
}
