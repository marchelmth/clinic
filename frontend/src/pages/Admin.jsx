import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";
import api from "../services/api.js";
import AdminDashboard from "../components/AdminDashboard.jsx";

export default function Dashboard() {
    return (
        <Layout title="Klinik Sehat | Admin Dashboard">
            <div className="container py-5 font-iosevka">
                <h2>Admin Dashboard</h2>
                <p>Welcome to the admin dashboard. Here you can manage doctors, appointments, and view statistics.</p>
                {/* Add more admin functionalities here */}
                <AdminDashboard />
            </div>
        </Layout>
    )
}