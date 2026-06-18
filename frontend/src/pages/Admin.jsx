import Header from "../components/Header.jsx";
import Layout from "../components/Layout.jsx";
import api from "../services/api.js";
import AdminDashboard from "../components/AdminDashboard.jsx";
import ProfilePicture from "../components/ProfilePicture.jsx";


export default function Dashboard() {
    return (
        <Layout title="Klinik Sehat | Admin Dashboard">
            <div className="container py-2 d-flex justify-content-end font-iosevka">
                <ProfilePicture />
            </div>
            <div className="container pb-5 font-iosevka">
                <h2>Admin Dashboard</h2>
                <p>Welcome to the admin dashboard. Here you can manage doctors, appointments, and view statistics.</p>
                <hr />
                <AdminDashboard />
            </div>
        </Layout>
    )
}