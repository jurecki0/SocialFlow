import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "firebaseService";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import "./accounts.css"; // Styles

const Accounts = () => {
  const [profile, setProfile] = useState({ linkedAccounts: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const userData = await getUserProfile();
      if (userData) {
        setProfile({ linkedAccounts: userData.linkedAccounts || [] });
      }
    };
    fetchProfile();
  }, []);

  return (
    <MDBox className="linked-accounts-container">
      <MDTypography variant="h5" className="account-section-title">
        Linked Accounts
      </MDTypography>

      {profile.linkedAccounts.length === 0 ? (
        <MDTypography className="no-accounts-message">
          Your profile doesn&apos;t have any linked accounts yet. Head over to your profile to link
          an account.
        </MDTypography>
      ) : (
        <Grid container spacing={2} className="account-grid">
          {profile.linkedAccounts.map((account, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              <Button
                onClick={() => navigate(`/accounts/${account.username}`)}
                className="account-card"
              >
                <MDAvatar
                  src={account.profilePic}
                  alt={account.username}
                  className="account-avatar"
                />
                <MDTypography className="account-username">{account.username}</MDTypography>
                <Icon fontSize="small">arrow_forward</Icon>
              </Button>
            </Grid>
          ))}
        </Grid>
      )}
    </MDBox>
  );
};

export default Accounts;
