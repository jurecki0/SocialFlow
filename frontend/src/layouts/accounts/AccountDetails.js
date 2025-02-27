import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchInstagramStats, fetchInstagramPosts, fetchPostPerformance } from "firebaseService";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import "./accounts.css";

const AccountDetails = () => {
  const { username } = useParams();
  const [followers, setFollowers] = useState("N/A");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Fetch Instagram Stats (Followers, etc.)
        const stats = await fetchInstagramStats(username);
        setFollowers(stats.followerCount || "N/A");

        // ✅ Fetch Instagram Posts
        const postData = await fetchInstagramPosts(username);

        // ✅ Fetch Post Metrics (Likes, Comments) for Each Post
        const enrichedPosts = await Promise.all(
          postData.map(async (post) => {
            const metrics = await fetchPostPerformance(post.id, post.accessToken);
            return { ...post, metrics };
          })
        );

        setPosts(enrichedPosts);
      } catch (error) {
        console.error("❌ Error fetching account details:", error);
      }
    };

    fetchData();
  }, [username]);

  return (
    <MDBox className="account-details-container">
      {/* 🔹 Account Header */}
      <MDBox className="account-header">
        <MDAvatar
          src={`https://graph.instagram.com/${username}/profile_picture`}
          className="account-avatar"
        />
        <MDTypography variant="h4">{username}</MDTypography>
        <MDTypography variant="h6">{followers} Followers</MDTypography>
      </MDBox>

      {/* 🔹 Recent Posts Section */}
      <MDBox className="posts-section">
        <MDTypography variant="h5">Recent Posts</MDTypography>
        <Grid container spacing={2}>
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Card className="post-card">
                  <img src={post.media_url} alt={post.caption} className="post-image" />
                  <MDTypography variant="body2" className="post-caption">
                    {post.caption}
                  </MDTypography>
                  <MDTypography variant="body2">
                    👍 {post.metrics?.likes || 0}
                    💬 {post.metrics?.comments || 0}
                  </MDTypography>
                </Card>
              </Grid>
            ))
          ) : (
            <MDTypography variant="body2" className="no-posts-message">
              No posts available.
            </MDTypography>
          )}
        </Grid>
      </MDBox>
    </MDBox>
  );
};

export default AccountDetails;
