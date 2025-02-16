import React, { useState, useEffect } from "react";
import { getUserProfile, storeUserProfile } from "firebaseService";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

function EditProfile() {
  const [profile, setProfile] = useState({ name: "", description: "" });

  useEffect(() => {
    async function fetchProfile() {
      const userData = await getUserProfile();
      if (userData) {
        setProfile(userData);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    await storeUserProfile(profile);
    alert("Profile updated!");
  };

  return (
    <MDBox>
      <MDTypography variant="h4">Edit Profile</MDTypography>
      <MDInput
        label="Name"
        value={profile.name}
        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        fullWidth
      />
      <MDInput
        label="Description"
        value={profile.description}
        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
        fullWidth
      />
      <MDButton onClick={handleSave} color="success">
        Save Changes
      </MDButton>
    </MDBox>
  );
}

export default EditProfile;
