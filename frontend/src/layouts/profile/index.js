import React, { useState, useEffect } from "react";
import { getUserProfile, storeUserProfile } from "firebaseService"; // Firestore functions
import { auth } from "firebaseConfig"; // Firebase Auth
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Header from "layouts/profile/components/Header"; // Import the Header component

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const userData = await getUserProfile();
      if (userData) {
        setProfile(userData);
        setUpdatedProfile(userData); // Pre-fill form
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
    <MDBox py={3}>
      {/* Header Component - Uses Profile Data */}
      <Header
        name={profile?.name || "User Name"}
        email={profile?.email || "email@example.com"}
        profilePic={profile?.profilePic || "https://via.placeholder.com/150"}
      />

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card>
            <MDBox p={3} textAlign="center">
              {/* User Details */}
              <MDTypography variant="h4">{profile?.name || "User Name"}</MDTypography>
              <MDTypography variant="subtitle1" color="textSecondary">
                {profile?.email || "email@example.com"}
              </MDTypography>
              <MDTypography variant="body1" mt={1}>
                {profile?.description || "User bio goes here..."}
              </MDTypography>

              {/* Edit Profile Button */}
              <MDBox mt={3}>
                <MDButton variant="contained" color="info" onClick={() => setEditing(true)}>
                  Edit Profile
                </MDButton>
              </MDBox>

              {/* Edit Profile Form */}
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
                    <MDButton variant="contained" color="success" onClick={handleUpdateProfile}>
                      Save
                    </MDButton>
                    <MDButton variant="outlined" color="error" onClick={() => setEditing(false)}>
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
