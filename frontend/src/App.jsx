import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Queue from "./pages/Queue.jsx";
import Reservation from "./pages/Reservation.jsx";
import Schedule from "./pages/Schedule.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import WaitVerifyEmail from "./pages/WaitVerifyEmail.jsx";
import Admin from "./pages/Admin.jsx";

import AdminRoute from "../router/AdminRoute.jsx";

const routes = {
  "/": Home,
  "/login": Login,
  "/profile": Profile,
  "/queue": Queue,
  "/reservation": Reservation,
  "/schedule": Schedule,
  "/signup": Signup,
  "/verify-email": VerifyEmail,
  "/wait-verify-email": WaitVerifyEmail,
  "/admin/dashboard": () => <AdminRoute><Admin /></AdminRoute>,
};

export default function App() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const routeKey = pathname.startsWith("/verify-email") ? "/verify-email" : pathname;
  const Page = routes[routeKey] || Home;
  return <Page />;
}
