import { useState, useEffect } from "react";
import PropTypes from "prop-types";

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

// SocialFlow components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// SocialFlow base styles
import breakpoints from "assets/theme/base/breakpoints";

// Firebase Services
import { getUserProfile } from "firebaseService";
import { auth } from "firebaseConfig";

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
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState({
    name: "User Name",
    profilePic: defaultProfilePic,
    jobTitle: "User Role",
    linkedAccounts: {}, // Store linked social media accounts
  });

  useEffect(() => {
    const handleTabsOrientation = () => {
      if (window.innerWidth < breakpoints.values.sm) {
        setTabsOrientation("vertical");
      } else {
        setTabsOrientation("horizontal");
      }
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
          linkedAccounts: userData.linkedAccounts || {},
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

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddAccount = async (platform) => {
    try {
      if (platform === "instagram") {
        // Step 1: Redirect to Instagram OAuth login
        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&redirect_uri=${process.env.REACT_APP_INSTAGRAM_REDIRECT_URI}&scope=pages_show_list,instagram_basic,instagram_manage_posts,instagram_content_publish,business_management&response_type=code`;
        window.location.href = authUrl;
      } else {
        console.warn(`Account linking for ${platform} is not yet implemented.`);
      }
    } catch (error) {
      console.error(`Error adding ${platform} account:`, error);
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
          <Grid item xs={12} sm={3} textAlign="center">
            <MDAvatar
              src={profile.profilePic}
              alt="profile-image"
              size="xl"
              shadow="sm"
              sx={{
                width: "100px",
                height: "100px",
                border: "3px solid white",
                marginTop: 2,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MDBox ml={{ xs: 0, sm: 3 }} textAlign={{ xs: "center", sm: "left" }}>
              <MDTypography variant="h4" fontWeight="medium" color="white">
                {profile.name}
              </MDTypography>
              <MDTypography variant="button" color="white" fontWeight="regular">
                {profile.jobTitle}
              </MDTypography>
            </MDBox>
          </Grid>

          <Grid item xs={12} sm={3} sx={{ ml: "auto", mt: { xs: 2, sm: 0 } }}>
            <AppBar position="static" sx={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Tabs
                orientation={tabsOrientation}
                value={tabValue}
                onChange={handleSetTabValue}
                textColor="white"
                indicatorColor="secondary"
                sx={{
                  ".MuiTabs-flexContainer": {
                    gap: 2,
                  },
                }}
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

          {socialPlatforms.map((platform) => {
            const accounts = profile.linkedAccounts[platform] || [];
            return (
              <MDBox key={platform} mb={2}>
                <MDTypography variant="h6" fontWeight="bold">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)} Accounts
                </MDTypography>

                {accounts.length > 0 ? (
                  <List>
                    {accounts.map((account, index) => (
                      <ListItem key={index} sx={{ pl: 2 }}>
                        <ListItemIcon>
                          <Icon>{socialIcons[platform] || "account_circle"}</Icon>
                        </ListItemIcon>
                        <ListItemText primary={account.username} secondary={account.email} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <MDTypography variant="body2" color="textSecondary" sx={{ pl: 2 }}>
                    No {platform} accounts linked.
                  </MDTypography>
                )}

                {/* Always show "Add Account" button */}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    mt: 1,
                    color: "white",
                  }}
                  startIcon={<Icon>add</Icon>}
                  onClick={() => handleAddAccount(platform)}
                >
                  Add {platform} Account
                </Button>
                <Divider sx={{ mt: 2 }} />
              </MDBox>
            );
          })}
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
