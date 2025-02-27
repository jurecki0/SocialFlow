import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useFacebookSDK from "hooks/useFacebookSDK"; // Import Facebook SDK hook

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import "../../profile.css";

// SocialFlow components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Firebase Services
import { getUserProfile, storeUserLinkedAccount } from "firebaseService";
import { auth, firestore } from "firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Images
import defaultProfilePic from "assets/images/bruce-mars.jpg";
import backgroundImage from "assets/images/bg-profile.jpeg";

// **Define social media platforms**
const socialPlatforms = ["instagram", "X", "facebook", "tiktok"];

// **Define icons for each platform**
const socialIcons = {
  instagram: "camera_alt",
  twitter: "twitter",
  facebook: "facebook",
  tiktok: "music_note",
};

function Header({ children }) {
  useFacebookSDK(); // Initialize Facebook SDK

  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState({
    name: "User Name",
    profilePic: defaultProfilePic,
    jobTitle: "User Role",
    linkedAccounts: {},
  });

  useEffect(() => {
    const handleTabsOrientation = () => {
      setTabsOrientation(window.innerWidth < 600 ? "vertical" : "horizontal");
    };

    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation();

    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const userData = await getUserProfile();
      if (userData) {
        setProfile({
          name: userData.name || "User Name",
          profilePic: userData.profilePic || defaultProfilePic,
          jobTitle: userData.jobTitle || "User Role",
          linkedAccounts: userData.linkedAccounts || [],
        });
      }
    };
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchInstagramBusinessId = async (accessToken) => {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/me/accounts?access_token=${accessToken}`
    );
    const data = await response.json();
    const facebookPageId = data?.data?.[0]?.id;
    if (!facebookPageId) {
      console.error("No linked Facebook page found!");
      return;
    }
    const igResponse = await fetch(
      `https://graph.facebook.com/v22.0/${facebookPageId}?fields=instagram_business_account&access_token=${accessToken}`
    );
    const igData = await igResponse.json();
    return igData.instagram_business_account?.id || null;
  };

  const fetchInstagramInsights = async (igBusinessId, accessToken) => {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${igBusinessId}/insights?metric=follower_count,impressions,reach&period=day&access_token=${accessToken}`
    );
    const data = await response.json();
    return data;
  };

  const uploadInstagramPost = async (igBusinessId, accessToken, imageUrl, caption) => {
    const response = await fetch(`https://graph.facebook.com/v22.0/${igBusinessId}/media`, {
      method: "POST",
      body: new URLSearchParams({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      }),
    });
    const data = await response.json();
    return data.id;
  };

  const publishInstagramPost = async (igBusinessId, mediaId, accessToken) => {
    const response = await fetch(`https://graph.facebook.com/v22.0/${igBusinessId}/media_publish`, {
      method: "POST",
      body: new URLSearchParams({
        creation_id: mediaId,
        access_token: accessToken,
      }),
    });
    const data = await response.json();
    return data.id;
  };

  const refreshInstagramAccessToken = async (shortLivedToken) => {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=${shortLivedToken}`
    );
    const data = await response.json();
    return data.access_token;
  };

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRemoveAccount = async (platform) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user.");

      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn("User document does not exist.");
        return;
      }

      const userData = userSnap.data();
      const updatedAccounts = userData.linkedAccounts.filter((acc) => acc.platform !== platform);

      await updateDoc(userRef, { linkedAccounts: updatedAccounts });

      // 🔹 Update local state to reflect changes in UI
      setProfile((prev) => ({
        ...prev,
        linkedAccounts: updatedAccounts,
      }));

      console.log(`✅ ${platform} account removed successfully.`);
    } catch (error) {
      console.error("❌ Error removing linked account:", error);
    }
  };

  const handleAddAccount = async (platform) => {
    const userProfile = await getUserProfile();
    if (userProfile?.linkedAccounts?.some((acc) => acc.platform === platform)) {
      console.log(`${platform} account already linked.`);
      return;
    }
    if (platform === "facebook") {
      if (typeof FB === "undefined") {
        console.error("Facebook SDK not loaded yet!");
        return;
      }
      FB.login(
        (loginResponse) => {
          if (loginResponse.authResponse) {
            console.log("Facebook login success:", loginResponse.authResponse);
            const { accessToken, userID } = loginResponse.authResponse;
            // Fetch Facebook user info
            FB.api("/me", { fields: "id,name,email,picture" }, async (fbUser) => {
              console.log("Fetched Facebook user:", fbUser);
              const accountData = {
                platform: "facebook",
                userId: userID,
                username: fbUser.name,
                email: fbUser.email || "N/A",
                profilePic: fbUser.picture?.data?.url || "",
                accessToken, // Store access token securely
                linkedAt: new Date(),
              };
              // Save to Firestore
              try {
                // ✅ Save to Firestore
                await storeUserLinkedAccount(accountData);

                // ✅ Update local state immediately
                setProfile((prev) => ({
                  ...prev,
                  linkedAccounts: [...(prev.linkedAccounts || []), accountData], // Append new account
                }));

                console.log("✅ Facebook account linked successfully!");
              } catch (error) {
                console.error("❌ Error storing Facebook account:", error);
              }
            });
          } else {
            console.warn("User cancelled Facebook login.");
          }
        },
        {
          scope: "public_profile,email,pages_show_list,instagram_basic",
        }
      );
    } else if (platform === "instagram") {
      const clientId = process.env.REACT_APP_FACEBOOK_APP_ID;
      const redirectUri = encodeURIComponent(
        "https://socialflow-64d23.web.app/auth/instagram/callback"
      );
      const scope =
        "public_profile,email,pages_show_list,instagram_basic,instagram_manage_insights";
      const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
      window.location.href = authUrl;
    } else {
      console.warn(`Account linking for ${platform} is not yet implemented.`);
    }
  };
  return (
    <MDBox position="relative" mb={5} mx={{ xs: 2, sm: 3, md: 4, lg: 6 }} mt={{ xs: 5, md: 8 }}>
      <Card
        sx={{
          p: 3,
          borderRadius: "lg",
          boxShadow: 3,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundImage: `url(${backgroundImage})`,
          maxWidth: "calc(100vw - 600px)",
          margin: "auto",
        }}
      >
        <Grid container alignItems="center">
          {/* Profile Picture */}
          <Grid item xs={12} sm={3} textAlign="center">
            <MDAvatar
              src={profile.profilePic}
              alt="profile-image"
              size="xl"
              shadow="sm"
              sx={{ width: "100px", height: "100px", border: "3px solid white", mt: 2 }}
            />
          </Grid>

          {/* User Info - Adjusted Alignment */}
          <Grid item xs={12} sm={6}>
            <MDBox display="flex" flexDirection="column" justifyContent="center">
              <MDTypography variant="h4" fontWeight="medium" color="primary">
                {profile.name}
              </MDTypography>
              <MDTypography variant="button" color="primary" fontWeight="regular">
                {profile.jobTitle}
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Tabs Section */}
          <Grid item xs={12} sm={3} sx={{ ml: "auto", mt: { xs: 2, sm: 0 } }}>
            <AppBar position="static" sx={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Tabs
                orientation={tabsOrientation}
                value={tabValue}
                onChange={handleSetTabValue}
                textColor="primary"
                indicatorColor="secondary"
                sx={{ ".MuiTabs-flexContainer": { gap: 2 } }}
              >
                <Tab label="App" icon={<Icon fontSize="small">home</Icon>} />
                <Tab label="Message" icon={<Icon fontSize="small">email</Icon>} />
                <Tab label="Settings" icon={<Icon fontSize="small">settings</Icon>} />
              </Tabs>
            </AppBar>
          </Grid>
        </Grid>
        {children}
      </Card>

      {/* Linked Accounts Section */}
      <MDBox mt={4}>
        <Card
          sx={{
            p: 3,
            borderRadius: "lg",
            boxShadow: 3,
            margin: "auto",
            maxWidth: "calc(100vw - 600px)",
          }}
        >
          <MDTypography variant="h5" fontWeight="medium" mb={2}>
            Linked Accounts
          </MDTypography>

          {/* Linked Accounts Grid */}
          <Grid container spacing={2} mb={3}>
            {profile?.linkedAccounts?.length > 0 ? (
              profile.linkedAccounts.map((account, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <MDBox display="flex" alignItems="center">
                      <MDAvatar
                        src={account.profilePic}
                        alt={account.username}
                        size="sm"
                        sx={{ mr: 2 }}
                      />
                      <MDTypography variant="h6">
                        {account.username} ({account.platform})
                      </MDTypography>
                    </MDBox>

                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ minWidth: "auto" }}
                      onClick={() => handleRemoveAccount(account.platform)}
                    >
                      <Icon fontSize="small">delete</Icon>
                    </Button>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <MDTypography variant="body2" color="primary">
                  No linked accounts.
                </MDTypography>
              </Grid>
            )}
          </Grid>

          {/* Add Accounts Section */}
          <Grid container spacing={2} justifyContent="center">
            {socialPlatforms.map((platform) => (
              <Grid item xs={12} sm={6} md={3} key={platform}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  sx={{
                    backgroundColor: "#28a745",
                    "&:hover": { backgroundColor: "#218838" },
                    color: "secondary",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textTransform: "none",
                    fontSize: "1rem",
                    py: 1.5,
                  }}
                  startIcon={<Icon>{socialIcons[platform]}</Icon>}
                  onClick={() => handleAddAccount(platform)}
                >
                  Link {platform}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Card>
      </MDBox>
    </MDBox>
  );
}

Header.defaultProps = {
  children: null,
};

Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
