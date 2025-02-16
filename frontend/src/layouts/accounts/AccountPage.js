import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchInstagramStats, fetchInstagramPosts } from "firebaseService";

// UI Components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import FollowersChart from "components/FollowersChart";
import RevenueChart from "components/RevenueChart";

const AccountPage = () => {
  const { username } = useParams();
  const [followersData, setFollowersData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setFollowersData(await fetchInstagramStats(username));
      setRevenueData(await fetchRevenueData(username));
      setPosts(await fetchInstagramPosts(username));
    };

    loadData();
  }, [username]);

  return (
    <MDBox>
      <MDTypography variant="h4" fontWeight="bold" mb={3}>
        {username}
      </MDTypography>

      {/* Followers & Revenue */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <MDTypography variant="h5">Gained Followers</MDTypography>
            <FollowersChart data={followersData} />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <MDTypography variant="h5">Revenue</MDTypography>
            <RevenueChart data={revenueData} />
          </Card>
        </Grid>
      </Grid>

      {/* Posts */}
      <MDTypography variant="h5" mt={4} mb={2}>
        Posts
      </MDTypography>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card sx={{ p: 2 }}>
              <MDBox component="img" src={post.media_url} width="100%" borderRadius="lg" />
              <MDTypography variant="body2" mt={1}>{post.caption}</MDTypography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MDBox>
  );
};

export default AccountPage;
