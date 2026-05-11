import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Queue from "./pages/Queue.jsx";
import Reservation from "./pages/Reservation.jsx";
import Schedule from "./pages/Schedule.jsx";
import Signup from "./pages/Signup.jsx";

const routes = {
  "/": Home,
  "/login": Login,
  "/profile": Profile,
  "/queue": Queue,
  "/reservation": Reservation,
  "/schedule": Schedule,
  "/signup": Signup,
};

export default function App() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const Page = routes[pathname] || Home;

  return <Page />;
}
