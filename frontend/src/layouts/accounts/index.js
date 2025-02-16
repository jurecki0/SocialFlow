import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserAccounts } from "firebaseService";

// UI Components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAccounts = async () => {
      const userAccounts = await fetchUserAccounts();
      setAccounts(userAccounts || []);
    };

    loadAccounts();
  }, []);

  return (
    <MDBox>
      <MDTypography variant="h4" fontWeight="bold" mb={2}>
        Linked Accounts
      </MDTypography>
      <Grid container spacing={2}>
        {accounts.map((account) => (
          <Grid item xs={12} sm={6} md={4} key={account.username}>
            <Card
              sx={{ p: 3, cursor: "pointer" }}
              onClick={() => navigate(`/accounts/${account.username}`)}
            >
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ mr: 2 }}>account_circle</Icon>
                <MDTypography variant="h6">{account.username}</MDTypography>
              </MDBox>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MDBox>
  );
};

export default Accounts;
