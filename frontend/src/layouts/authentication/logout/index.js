import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "firebaseConfig";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await auth.signOut();
        console.log("User logged out successfully!");
        navigate("/authentication/sign-in"); // Redirect to Sign-In page
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    handleLogout();
  }, [navigate]);

  return <div>Logging out...</div>; // Show a simple message while logging out
}

export default Logout;
