import { useEffect, useState } from "react";

function getProfileName() {
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "null");
  const storedProfileName = localStorage.getItem("profile_name");

  return authUser?.profile_name || storedProfileName || authUser?.name || "User";
}

export default function ProfilePicture({ className = "" }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("User");

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("auth_token")));
    setProfileName(getProfileName());
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

      {isLoggedIn && (
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
