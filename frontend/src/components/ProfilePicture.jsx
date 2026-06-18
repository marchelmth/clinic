import { useEffect, useState } from "react";
import api from "../services/api";
import { showToast } from "../utils/toast.js";

export default function ProfilePicture({ className = "", isProfile = false }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("User");
  const [isProfilePage, setIsProfilePage] = useState(isProfile);
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    api.get("/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setProfileName(res.data.data.name);
        setIsLoggedIn(true)
      })
      .catch((error) => {
        showToast("error", "error", error);
        setIsLoggedIn(false);
      })
    setIsProfilePage(isProfile);
  }, []);

  const avatarUrl = `https://ui-avatars.com/api/?rounded=true&name=${encodeURIComponent(
    profileName,
  )}&background=000&color=ffff&size=100`;

  return (
    <div className={`auth-profile ${className}`}>
      {!isLoggedIn && (
        <a href="/login" className="btn btn-success btn-sm text-white rounded-2 me-2">
          Login
        </a>
      )}

      {isLoggedIn && isProfilePage && (
        <a aria-label="Profile">
          <img
            src={avatarUrl}
            alt={`${profileName} profile`}
            width="35"
            height="35"
            className="img-fluid rounded-circle"
          />
        </a>
      )}

      {isLoggedIn && !isProfilePage && (
        <a href="/profile" aria-label="Profile">
          <img
            src={avatarUrl}
            alt={`${profileName} profile`}
            width="35"
            height="35"
            className="img-fluid rounded-circle"
          />
        </a>
      )}
    </div>
  );
}
