import React, { useState, useEffect } from "react";
import { getUserProfile, storeUserProfile } from "../../firebaseService";
import { auth } from "firebaseConfig"; // Firebase Auth
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Header from "layouts/profile/components/Header";
import "./profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const userData = await getUserProfile();
      if (userData) {
        setProfile(userData);
        setUpdatedProfile(userData);
      }
    };

    auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile();
      }
    });
  }, []);

  // Handle profile updates
  const handleUpdateProfile = async () => {
    await storeUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setEditing(false);
  };

  return (
    <MDBox py={3} className="md-box-container">
      {/* Header Component - Uses Profile Data */}
      <Header
        name={profile?.name || "User Name"}
        email={profile?.email || "email@example.com"}
        profilePic={profile?.profilePic || "https://via.placeholder.com/150"}
      />

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card
            sx={{
              width: "100% !important",
              maxWidth: "100% !important",
            }}
            className="profile-card"
          >
            <MDBox p={3} textAlign="center">
              <MDTypography variant="h4" className="user-name">
                {profile?.name || "User Name"}
              </MDTypography>
              <MDTypography variant="subtitle1" className="user-role">
                {profile?.email || "email@example.com"}
              </MDTypography>
              <MDTypography variant="body1" mt={1}>
                {profile?.description || "User bio goes here..."}
              </MDTypography>

              <MDBox mt={3}>
                <MDButton variant="contained" color="info" onClick={() => setEditing(true)}>
                  Edit Profile
                </MDButton>
              </MDBox>

              {editing && (
                <MDBox mt={3} textAlign="left">
                  <MDInput
                    label="Name"
                    value={updatedProfile.name}
                    onChange={(e) => setUpdatedProfile({ ...updatedProfile, name: e.target.value })}
                    fullWidth
                  />
                  <MDInput
                    label="Bio"
                    value={updatedProfile.description}
                    onChange={(e) =>
                      setUpdatedProfile({ ...updatedProfile, description: e.target.value })
                    }
                    fullWidth
                    multiline
                  />
                  <MDBox mt={2} display="flex" justifyContent="space-between">
                    <MDButton
                      variant="contained"
                      color="success"
                      onClick={handleUpdateProfile}
                      className="add-account-button"
                    >
                      Save
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      color="error"
                      onClick={() => setEditing(false)}
                      className="delete-button"
                    >
                      Cancel
                    </MDButton>
                  </MDBox>
                </MDBox>
              )}
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default Profile;
