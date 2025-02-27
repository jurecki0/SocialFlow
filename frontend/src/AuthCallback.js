import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeUserLinkedAccount } from "firebaseService";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      console.log("Instagram OAuth Code:", code); // 🔹 Debugging

      if (!code) {
        console.error("No authorization code found.");
        return navigate("/dashboard");
      }

      try {
        const response = await fetch("https://graph.facebook.com/v22.0/oauth/access_token", {
          method: "POST",
          body: new URLSearchParams({
            client_id: process.env.REACT_APP_FACEBOOK_APP_ID,
            client_secret: process.env.REACT_APP_FACEBOOK_APP_SECRET,
            redirect_uri: "https://socialflow-64d23.web.app/auth/instagram/callback",
            code,
          }),
        });
        const data = await response.json();
        console.log("API Response:", data); // 🔹 Debugging
        if (!data.access_token) {
          throw new Error(
            `Failed to retrieve access token: ${data.error?.message || "Unknown error"}`
          );
        }
        // Store access token in Firestore
        await storeUserLinkedAccount({
          platform: "instagram",
          accessToken: data.access_token,
          linkedAt: new Date(),
        });

        console.log("✅ Instagram linked successfully!");
        navigate("/dashboard");
      } catch (error) {
        console.error("❌ Error during Instagram auth:", error);
        navigate("/dashboard");
      }
    };

    exchangeCodeForToken();
  }, [navigate]);

  return <div>Authenticating Instagram...</div>;
};

export default AuthCallback;
