import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { storeUserLinkedAccount } from "firebaseService";

const InstagramCallback = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      if (!code) return;

      try {
        // ✅ Step 1: Exchange Code for User Access Token
        const response = await fetch("https://graph.facebook.com/v22.0/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.REACT_APP_FACEBOOK_APP_ID,
            client_secret: process.env.REACT_APP_FACEBOOK_APP_SECRET,
            grant_type: "authorization_code",
            redirect_uri: "https://socialflow-64d23.web.app/auth/instagram/callback",
            code,
          }),
        });

        const data = await response.json();
        if (!data.access_token) throw new Error("Failed to retrieve access token.");

        console.log("✅ User Access Token:", data.access_token);

        // ✅ Step 2: Manually Set Your Page ID
        const facebookPageId = process.env.REACT_APP_FACEBOOK_PAGE_ID;

        // ✅ Step 3: Retrieve Page Access Token
        const pageTokenResponse = await fetch(
          `https://graph.facebook.com/v22.0/${facebookPageId}?fields=access_token&access_token=${data.access_token}`
        );
        const pageTokenData = await pageTokenResponse.json();
        if (!pageTokenData.access_token) throw new Error("Failed to get Page Access Token.");

        const pageAccessToken = pageTokenData.access_token;
        console.log("✅ Page Access Token:", pageAccessToken);

        // ✅ Step 4: Get Instagram Business Account ID
        const igBusinessResponse = await fetch(
          `https://graph.facebook.com/v22.0/${facebookPageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
        );
        const igBusinessData = await igBusinessResponse.json();
        if (!igBusinessData.instagram_business_account?.id)
          throw new Error("No linked Instagram Business Account found.");

        const instagramBusinessId = igBusinessData.instagram_business_account.id;
        console.log("✅ Instagram Business Account ID:", instagramBusinessId);

        // ✅ Step 5: Fetch Instagram Profile
        const igProfileResponse = await fetch(
          `https://graph.facebook.com/v22.0/${instagramBusinessId}?fields=id,username,profile_picture_url&access_token=${pageAccessToken}`
        );
        const igProfile = await igProfileResponse.json();
        if (!igProfile.id) throw new Error("Failed to fetch Instagram profile.");

        console.log("✅ Instagram Profile:", igProfile);

        // ✅ Step 6: Store Instagram Account in Firestore
        const accountData = {
          platform: "instagram",
          userId: igProfile.id,
          username: igProfile.username,
          profilePic: igProfile.profile_picture_url || "",
          accessToken: pageAccessToken, // ✅ Use Page Access Token for API requests
          linkedAt: new Date(),
        };

        await storeUserLinkedAccount(accountData);
        console.log("✅ Instagram account linked successfully!", accountData);

        // ✅ Step 7: Redirect User to Profile Page
        window.location.href = "/profile";
      } catch (error) {
        console.error("❌ Error processing Instagram login:", error.message);
      }
    };

    exchangeCodeForToken();
  }, [code]);

  return <div>Processing Instagram login...</div>;
};

export default InstagramCallback;
